from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from services.traffic_service import get_current_traffic


@dataclass
class LocationPoint:
    name: str
    lat: float
    lon: float


class RouteService:
    async def geocode_place(self, place: str) -> LocationPoint:
        query = place.strip()
        if not query:
            raise ValueError("Location cannot be empty")

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query, "format": "json", "limit": 1},
                headers={"User-Agent": "traffic-ai-route-planner/1.0"},
            )
            response.raise_for_status()
            data = response.json()

        if not data:
            raise ValueError(f"Unable to locate '{place}'")

        top = data[0]
        return LocationPoint(
            name=top.get("display_name", query),
            lat=float(top["lat"]),
            lon=float(top["lon"]),
        )

    async def get_route(self, source: str, destination: str) -> dict[str, Any]:
        src = await self.geocode_place(source)
        dst = await self.geocode_place(destination)

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                f"https://router.project-osrm.org/route/v1/driving/{src.lon},{src.lat};{dst.lon},{dst.lat}",
                params={"overview": "full", "geometries": "geojson", "alternatives": "false"},
                headers={"User-Agent": "traffic-ai-route-planner/1.0"},
            )
            response.raise_for_status()
            payload = response.json()

        routes = payload.get("routes", [])
        if not routes:
            raise ValueError("Unable to calculate route for selected locations")

        primary = routes[0]
        distance_km = round(primary["distance"] / 1000, 2)
        duration_min = round(primary["duration"] / 60, 1)

        traffic = self._infer_traffic_level(duration_min, distance_km)
        alerts = self._build_alerts(traffic)

        geometry = primary.get("geometry", {}).get("coordinates", [])
        coordinates = [{"lat": point[1], "lng": point[0]} for point in geometry]

        return {
            "from_location": {
                "name": src.name,
                "lat": src.lat,
                "lng": src.lon,
            },
            "to_location": {
                "name": dst.name,
                "lat": dst.lat,
                "lng": dst.lon,
            },
            "traffic_level": traffic,
            "estimated_time_minutes": duration_min,
            "distance_km": distance_km,
            "best_route": {
                "summary": f"Best route from {source} to {destination}",
                "coordinates": coordinates,
            },
            "alerts": alerts,
        }

    def _infer_traffic_level(self, duration_min: float, distance_km: float) -> str:
        ratio = duration_min / max(distance_km, 1)

        if ratio > 3.8:
            return "high"
        if ratio > 2.2:
            return "medium"
        return "low"

    def _build_alerts(self, traffic_level: str) -> list[str]:
        city_alerts = []
        snapshot = get_current_traffic()

        for area in snapshot:
            if area["congestion_level"] == "high":
                city_alerts.append(f"Heavy congestion in {area['area']}")

        if traffic_level == "high":
            city_alerts.insert(0, "Congestion likely along major stretches")
            city_alerts.append("Possible delays due to traffic bottlenecks")
        elif traffic_level == "medium":
            city_alerts.insert(0, "Moderate traffic expected")

        if not city_alerts:
            city_alerts.append("No major incidents reported")

        return city_alerts[:5]


route_service = RouteService()
