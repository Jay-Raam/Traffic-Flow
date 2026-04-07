"use client";

import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";

import { RouteResult } from "@/types/traffic";

const trafficColor = {
    low: "#16a34a",
    medium: "#eab308",
    high: "#dc2626",
};

export function RoutePlannerMap({ route }: { route: RouteResult }) {
    const from = [route.from_location.lat, route.from_location.lng] as [number, number];
    const to = [route.to_location.lat, route.to_location.lng] as [number, number];
    const line = route.best_route.coordinates.map((point) => [point.lat, point.lng] as [number, number]);

    const fromIcon = useMemo(
        () =>
            L.icon({
                iconUrl: "/assets/pin-from.svg",
                iconSize: [32, 42],
                iconAnchor: [16, 42],
                tooltipAnchor: [0, -36],
            }),
        []
    );

    const toIcon = useMemo(
        () =>
            L.icon({
                iconUrl: "/assets/pin-to.svg",
                iconSize: [32, 42],
                iconAnchor: [16, 42],
                tooltipAnchor: [0, -36],
            }),
        []
    );

    const center: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

    return (
        <div className="panel h-[520px] overflow-hidden p-0">
            <MapContainer center={center} zoom={12} className="h-full w-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                <Marker position={from} icon={fromIcon}>
                    <Tooltip>From: {route.from_location.name}</Tooltip>
                </Marker>

                <Marker position={to} icon={toIcon}>
                    <Tooltip>To: {route.to_location.name}</Tooltip>
                </Marker>

                <Polyline positions={line} pathOptions={{ color: trafficColor[route.traffic_level], weight: 6, opacity: 0.85 }} />
            </MapContainer>
        </div>
    );
}
