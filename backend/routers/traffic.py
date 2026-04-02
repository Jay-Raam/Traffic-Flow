from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from models.schemas import (
    HistoryResponse,
    OptimizeRequest,
    OptimizeResponse,
    RouteRequest,
    RouteResponse,
    TrafficResponse,
)
from services.ai_service import ai_service
from services.route_service import route_service
from services import traffic_service
from utils.rate_limit import limiter

router = APIRouter(tags=["traffic"])


@router.get("/traffic", response_model=TrafficResponse)
@limiter.limit("30/minute")
async def get_traffic(request: Request):
    data = traffic_service.get_current_traffic()
    return {"data": data, "generated_at": datetime.now(timezone.utc)}


@router.post("/optimize", response_model=OptimizeResponse)
@limiter.limit("5/minute")
async def optimize_traffic(request: Request, payload: OptimizeRequest):
    data = traffic_service.get_current_traffic(force_refresh=payload.force_refresh)
    if payload.areas:
        data = [row for row in data if row["area"].lower() in {a.lower() for a in payload.areas}]

    if not data:
        raise HTTPException(status_code=404, detail="No matching traffic areas found")

    optimized = await ai_service.optimize(data)
    return optimized


@router.get("/history", response_model=HistoryResponse)
@limiter.limit("30/minute")
async def get_history(request: Request):
    points = traffic_service.get_history(limit=300)
    return {"points": points}


@router.post("/route", response_model=RouteResponse)
@limiter.limit("20/minute")
async def build_route(request: Request, payload: RouteRequest):
    try:
        return await route_service.get_route(payload.source, payload.destination)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=502, detail="Route provider temporarily unavailable")
