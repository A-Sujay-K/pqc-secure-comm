import redis.asyncio as redis
from typing import Optional
from loguru import logger

_redis: Optional[redis.Redis] = None

async def init_redis(uri: str):
    global _redis
    logger.info("Initializing Redis connection...")
    _redis = redis.from_url(uri, decode_responses=True)
    # Test connection
    try:
        await _redis.ping()
        logger.info("Redis connection established.")
    except Exception as e:
        logger.error(f"Error connecting to Redis: {e}")

def get_redis() -> redis.Redis:
    if _redis is None:
        raise RuntimeError("Redis is not initialized.")
    return _redis

async def close_redis():
    global _redis
    if _redis:
        await _redis.close()
        logger.info("Redis connection closed.")
