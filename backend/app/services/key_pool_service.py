from __future__ import annotations
from app.db.redis_client import get_redis
from app.utils.constants import KEY_POOL_PREFIX
from loguru import logger


async def get_available_key_count() -> int:
    """Return the number of QKD keys currently available in the Redis pool."""
    redis = get_redis()
    count = await redis.llen(KEY_POOL_PREFIX)
    return count or 0


async def pop_key() -> str | None:
    """
    Pop and return one QKD key_hex from the Redis pool (FIFO).
    Returns None if the pool is empty.
    """
    redis = get_redis()
    key_hex = await redis.lpop(KEY_POOL_PREFIX)
    if key_hex:
        logger.debug(f"Popped QKD key from pool (pool size now: {await get_available_key_count()})")
    return key_hex


async def push_key(key_hex: str) -> None:
    """Push a new QKD key_hex onto the right end of the Redis pool (FIFO)."""
    redis = get_redis()
    await redis.rpush(KEY_POOL_PREFIX, key_hex)
    logger.debug(f"Pushed new QKD key (pool size now: {await redis.llen(KEY_POOL_PREFIX)})")
