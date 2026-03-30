from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import socketio

from config import settings
from services.traffic_service import generate_traffic_snapshot


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[])
socket_app = socketio.ASGIApp(sio, socketio_path="ws/socket.io")


async def safe_socket_app(scope, receive, send):
    try:
        await socket_app(scope, receive, send)
    except RuntimeError as exc:
        # Some websocket probes hit non-engineio paths under /ws.
        # Close gracefully instead of bubbling an ASGI message-type mismatch.
        if scope.get("type") == "websocket" and "Expected ASGI message" in str(exc):
            await send({"type": "websocket.close", "code": 1000})
            return
        raise


@sio.event
async def connect(sid, environ, auth):
    await sio.emit("system", {"message": "Connected to traffic stream", "sid": sid}, to=sid)


@sio.event
async def disconnect(sid):
    return


async def broadcast_traffic_loop() -> None:
    while True:
        snapshot = generate_traffic_snapshot()
        alerts = [
            {"area": row["area"], "message": f"Heavy congestion expected in {row['area']}"}
            for row in snapshot
            if row["congestion_level"] == "high"
        ]

        await sio.emit(
            "traffic_update",
            {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "data": snapshot,
            },
        )
        if alerts:
            await sio.emit("congestion_alerts", {"alerts": alerts})

        await asyncio.sleep(settings.traffic_stream_interval_seconds)
