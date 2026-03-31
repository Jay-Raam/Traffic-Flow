from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd

AREAS = [
    "Anna Salai",
    "T Nagar",
    "Guindy",
    "OMR",
    "Velachery",
    "Tambaram",
]

_HISTORY_LIMIT = 500
_history: deque[dict[str, Any]] = deque(maxlen=_HISTORY_LIMIT)
_latest_snapshot: list[dict[str, Any]] = []
_rng = np.random.default_rng(seed=42)


def _congestion_level(vehicles: int, avg_speed: float) -> str:
    if vehicles > 220 or avg_speed < 20:
        return "high"
    if vehicles > 140 or avg_speed < 35:
        return "medium"
    return "low"


def generate_traffic_snapshot() -> list[dict[str, Any]]:
    global _latest_snapshot

    baseline = _rng.integers(low=60, high=260, size=len(AREAS))
    speed = _rng.normal(loc=35, scale=10, size=len(AREAS)).clip(8, 70)
    congestion_levels = [
        _congestion_level(int(vehicles), float(avg_speed))
        for vehicles, avg_speed in zip(baseline, speed)
    ]

    frame = pd.DataFrame(
        {
            "area": AREAS,
            "vehicles": baseline,
            "avg_speed_kmph": np.round(speed, 1),
            "congestion_level": congestion_levels,
        }
    )
    frame["density_score"] = np.round(frame["vehicles"] / frame["avg_speed_kmph"], 2)

    now = datetime.now(timezone.utc)
    frame["timestamp"] = now
    snapshot: list[dict[str, Any]] = [
        {str(key): value for key, value in item.items()}
        for item in frame.to_dict(orient="records")
    ]

    for point in snapshot:
        _history.append(point)

    _latest_snapshot = snapshot
    return snapshot


def get_current_traffic(force_refresh: bool = False) -> list[dict[str, Any]]:
    if force_refresh or not _latest_snapshot:
        return generate_traffic_snapshot()
    return _latest_snapshot


def get_history(limit: int = 200) -> list[dict[str, Any]]:
    return list(_history)[-limit:]


def get_recent_area_history(area: str, window: int = 20) -> list[dict[str, Any]]:
    filtered = [point for point in _history if point["area"].lower() == area.lower()]
    return filtered[-window:]


def list_areas() -> list[str]:
    return AREAS
