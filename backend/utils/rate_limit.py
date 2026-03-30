from slowapi import Limiter
from slowapi.util import get_remote_address
import redis

from config import settings


def build_limiter(redis_url: str) -> Limiter:
    try:
        redis.from_url(redis_url, socket_connect_timeout=0.5).ping()
        return Limiter(key_func=get_remote_address, storage_uri=redis_url)
    except Exception:
        # Fallback keeps app running even when Redis is unavailable.
        return Limiter(key_func=get_remote_address)


limiter = build_limiter(settings.redis_url)
