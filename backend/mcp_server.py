from __future__ import annotations

import sys
from typing import Any

from utils.mcp_tools import analyze_traffic, optimize_signal, predict_congestion

try:
    from mcp.server.fastmcp import FastMCP
except Exception:  # pragma: no cover
    FastMCP = None


mcp = FastMCP("traffic-flow-optimizer") if FastMCP else None

if mcp:

    @mcp.tool()
    def analyze_traffic_tool(data: list[dict[str, Any]]) -> dict[str, Any]:
        return analyze_traffic(data)

    @mcp.tool()
    def predict_congestion_tool(area: str) -> dict[str, Any]:
        return predict_congestion(area)

    @mcp.tool()
    def optimize_signal_tool(area: str, prediction: str) -> dict[str, Any]:
        return optimize_signal(area, prediction)


def run() -> None:
    if not mcp:
        raise RuntimeError("MCP server dependencies are unavailable.")

    # FastMCP stdio transport expects JSON-RPC messages from an MCP client.
    # Running this directly in an interactive terminal can feed plain text/newlines,
    # which causes JSON validation errors.
    if sys.stdin.isatty():
        print(
            "MCP server uses stdio and must be started by an MCP client. "
            "Run API with: uvicorn main:app --reload --port 8000"
        )
        return

    mcp.run()


if __name__ == "__main__":
    run()
