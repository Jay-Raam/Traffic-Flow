from __future__ import annotations

from statistics import mean
from typing import Any, Callable

from services import traffic_service


def analyze_traffic(data: list[dict[str, Any]]) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    for point in data:
        vehicles = int(point["vehicles"])
        avg_speed = float(point.get("avg_speed_kmph", 30))
        if vehicles > 220 or avg_speed < 20:
            level = "high"
        elif vehicles > 140 or avg_speed < 35:
            level = "medium"
        else:
            level = "low"
        results.append({"area": point["area"], "congestion": level})

    high_count = len([r for r in results if r["congestion"] == "high"])
    return {"analysis": results, "high_congestion_count": high_count}


def predict_congestion(area: str) -> dict[str, Any]:
    recent = traffic_service.get_recent_area_history(area, window=15)
    if not recent:
        return {
            "area": area,
            "prediction": "medium",
            "minutes_ahead": 15,
            "reason": "Insufficient history, fallback heuristic applied.",
        }

    vehicles_avg = mean(int(point["vehicles"]) for point in recent)
    speed_avg = mean(float(point["avg_speed_kmph"]) for point in recent)

    if vehicles_avg > 210 or speed_avg < 22:
        prediction = "high"
    elif vehicles_avg > 140 or speed_avg < 32:
        prediction = "medium"
    else:
        prediction = "low"

    return {
        "area": area,
        "prediction": prediction,
        "minutes_ahead": 15,
        "vehicles_avg": round(vehicles_avg, 1),
        "speed_avg": round(speed_avg, 1),
    }


def optimize_signal(area: str, prediction: str) -> dict[str, Any]:
    if prediction == "high":
        timing = {"green": 75, "yellow": 6, "red": 35}
    elif prediction == "medium":
        timing = {"green": 55, "yellow": 5, "red": 40}
    else:
        timing = {"green": 40, "yellow": 4, "red": 45}

    return {"area": area, "timing": timing}


TOOLS: dict[str, Callable[..., dict[str, Any]]] = {
    "analyze_traffic": analyze_traffic,
    "predict_congestion": predict_congestion,
    "optimize_signal": optimize_signal,
}


def execute_tool(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    if tool_name not in TOOLS:
        raise ValueError(f"Unknown tool: {tool_name}")
    return TOOLS[tool_name](**arguments)
