from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

from config import settings
from routers.traffic import router as traffic_router
from utils.rate_limit import limiter
from utils.socket_manager import broadcast_traffic_loop, safe_socket_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    stream_task = asyncio.create_task(broadcast_traffic_loop())
    yield
    stream_task.cancel()


app = FastAPI(title="Traffic Flow Optimization API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.state.key_func = get_remote_address


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too Many Requests", "error": "Rate limit exceeded"},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)

app.include_router(traffic_router)
app.mount("/ws", safe_socket_app)


@app.get("/health")
@limiter.exempt
async def health(request: Request):
    return {"status": "ok"}
