from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class TrafficDatum(BaseModel):
    area: str
    vehicles: int = Field(ge=0)
    avg_speed_kmph: float = Field(ge=0)
    congestion_level: str
    density_score: float = Field(ge=0)
    timestamp: datetime


class TrafficResponse(BaseModel):
    data: list[TrafficDatum]
    generated_at: datetime


class OptimizeRequest(BaseModel):
    areas: list[str] | None = None
    force_refresh: bool = False


class SignalTiming(BaseModel):
    green: int
    yellow: int
    red: int


class AreaOptimization(BaseModel):
    area: str
    congestion_level: str
    prediction: str
    signal_timing: SignalTiming


class OptimizeResponse(BaseModel):
    generated_at: datetime
    suggestions: list[AreaOptimization]
    ai_summary: str
    tools_used: list[str]


class HistoryPoint(BaseModel):
    timestamp: datetime
    area: str
    vehicles: int
    avg_speed_kmph: float
    congestion_level: str


class HistoryResponse(BaseModel):
    points: list[HistoryPoint]


class MCPToolResult(BaseModel):
    tool: str
    output: dict[str, Any]


class RouteRequest(BaseModel):
    source: str = Field(min_length=2)
    destination: str = Field(min_length=2)


class RouteLocation(BaseModel):
    name: str
    lat: float
    lng: float


class RouteCoordinate(BaseModel):
    lat: float
    lng: float


class BestRoute(BaseModel):
    summary: str
    coordinates: list[RouteCoordinate]


class RouteResponse(BaseModel):
    from_location: RouteLocation
    to_location: RouteLocation
    traffic_level: str
    estimated_time_minutes: float
    distance_km: float
    best_route: BestRoute
    alerts: list[str]
