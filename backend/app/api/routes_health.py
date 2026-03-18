from __future__ import annotations
from fastapi import APIRouter, Depends
from app.db.mongodb import get_database
from app.db.redis_client import get_redis
from loguru import logger

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check(
    db=Depends(get_database),
    redis=Depends(get_redis),
):
    """Return the health status of all services."""
    mongo_ok = False
    redis_ok = False

    try:
        await db.command("ping")
        mongo_ok = True
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")

    try:
        await redis.ping()
        redis_ok = True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")

    return {
        "status": "healthy" if mongo_ok and redis_ok else "degraded",
        "mongodb": "ok" if mongo_ok else "error",
        "redis": "ok" if redis_ok else "error",
    }
