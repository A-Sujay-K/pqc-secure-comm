from __future__ import annotations
import redis.asyncio as redis
from loguru import logger

_redis: redis.Redis | None = None


async def init_redis(uri: str) -> None:
    """Initialize the async Redis connection pool."""
    global _redis
    _redis = await redis.from_url(uri, decode_responses=True)
    await _redis.ping()
    logger.info("Redis connection established")


def get_redis() -> redis.Redis:
    """Return the active Redis instance."""
    if _redis is None:
        raise RuntimeError("Redis has not been initialized. Call init_redis() first.")
    return _redis


async def close_redis() -> None:
    """Close the Redis connection."""
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
        logger.info("Redis connection closed")
