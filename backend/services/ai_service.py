from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import httpx

from config import settings
from utils.mcp_tools import execute_tool

SYSTEM_PROMPT = """You are a traffic optimization AI.\n\nAvailable tools:\n- analyze_traffic\n- predict_congestion\n- optimize_signal\n\nGoal:\nReduce congestion and improve traffic flow.\n\nSteps:\n1. Analyze current traffic\n2. Predict upcoming congestion\n3. Optimize signal timing\n\nYou MUST use the tools to produce decisions, then summarize the result."""

TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "analyze_traffic",
            "description": "Determine congestion level by area.",
            "parameters": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "area": {"type": "string"},
                                "vehicles": {"type": "number"},
                                "avg_speed_kmph": {"type": "number"},
                            },
                            "required": ["area", "vehicles", "avg_speed_kmph"],
                        },
                    }
                },
                "required": ["data"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "predict_congestion",
            "description": "Predict congestion level for the next 10-15 minutes.",
            "parameters": {
                "type": "object",
                "properties": {"area": {"type": "string"}},
                "required": ["area"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "optimize_signal",
            "description": "Return optimized traffic signal timing based on predicted congestion.",
            "parameters": {
                "type": "object",
                "properties": {
                    "area": {"type": "string"},
                    "prediction": {"type": "string", "enum": ["low", "medium", "high"]},
                },
                "required": ["area", "prediction"],
            },
        },
    },
]


class AIService:
    async def optimize(self, traffic_data: list[dict[str, Any]]) -> dict[str, Any]:
        if not settings.openrouter_api_key:
            return self._local_optimize(traffic_data)

        try:
            return await self._openrouter_optimize(traffic_data)
        except Exception:
            return self._local_optimize(traffic_data)

    def _local_optimize(self, traffic_data: list[dict[str, Any]]) -> dict[str, Any]:
        tools_used: list[str] = []
        analysis = execute_tool("analyze_traffic", {"data": traffic_data})
        tools_used.append("analyze_traffic")

        suggestions = []
        for entry in analysis["analysis"]:
            prediction = execute_tool("predict_congestion", {"area": entry["area"]})
            signal = execute_tool(
                "optimize_signal",
                {"area": entry["area"], "prediction": prediction["prediction"]},
            )
            tools_used.extend(["predict_congestion", "optimize_signal"])
            suggestions.append(
                {
                    "area": entry["area"],
                    "congestion_level": entry["congestion"],
                    "prediction": prediction["prediction"],
                    "signal_timing": signal["timing"],
                }
            )

        high_areas = [s["area"] for s in suggestions if s["prediction"] == "high"]
        ai_summary = (
            "Heavy congestion expected in " + ", ".join(high_areas)
            if high_areas
            else "Traffic remains manageable across monitored zones."
        )
        return {
            "generated_at": datetime.now(timezone.utc),
            "suggestions": suggestions,
            "tools_used": tools_used,
            "ai_summary": ai_summary,
        }

    async def _openrouter_optimize(self, traffic_data: list[dict[str, Any]]) -> dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
        }

        messages: list[dict[str, Any]] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Optimize this traffic payload by calling tools first and then summarize.\n"
                    + json.dumps({"traffic_data": traffic_data})
                ),
            },
        ]

        tools_used: list[str] = []
        collected: dict[str, Any] = {"analysis": None, "predictions": {}, "signals": {}}

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers=headers,
                json={
                    "model": settings.openrouter_model,
                    "messages": messages,
                    "tools": TOOLS_SCHEMA,
                    "tool_choice": "auto",
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            payload = response.json()

            assistant_message = payload["choices"][0]["message"]
            tool_calls = assistant_message.get("tool_calls", [])

            for call in tool_calls:
                fn_name = call["function"]["name"]
                args = json.loads(call["function"]["arguments"] or "{}")
                result = execute_tool(fn_name, args)
                tools_used.append(fn_name)

                if fn_name == "analyze_traffic":
                    collected["analysis"] = result
                elif fn_name == "predict_congestion":
                    collected["predictions"][result["area"]] = result
                elif fn_name == "optimize_signal":
                    collected["signals"][result["area"]] = result

                messages.append(assistant_message)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call["id"],
                        "name": fn_name,
                        "content": json.dumps(result),
                    }
                )

            if not tools_used:
                return self._local_optimize(traffic_data)

            follow_up = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers=headers,
                json={
                    "model": settings.openrouter_model,
                    "messages": messages,
                    "temperature": 0.2,
                },
            )
            follow_up.raise_for_status()
            summary = follow_up.json()["choices"][0]["message"].get("content", "")

        analysis_rows = (collected.get("analysis") or {}).get("analysis", [])
        suggestions = []
        for row in analysis_rows:
            area = row["area"]
            prediction = collected["predictions"].get(area, {}).get("prediction", row["congestion"])
            timing = collected["signals"].get(area, {}).get(
                "timing", {"green": 55, "yellow": 5, "red": 40}
            )
            suggestions.append(
                {
                    "area": area,
                    "congestion_level": row["congestion"],
                    "prediction": prediction,
                    "signal_timing": timing,
                }
            )

        return {
            "generated_at": datetime.now(timezone.utc),
            "suggestions": suggestions,
            "tools_used": tools_used,
            "ai_summary": summary or "Optimization completed via AI tool workflow.",
        }


ai_service = AIService()
