from fastapi import APIRouter
import time
from app.db.mongodb import get_database
from app.db.redis_client import get_redis

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

@router.get("/readiness")
async def readiness_check():
    db = get_database()
    redis_client = get_redis()
    
    db_status = "ok"
    redis_status = "ok"
    
    try:
        await db.command("ping")
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    try:
        await redis_client.ping()
    except Exception as e:
        redis_status = f"error: {str(e)}"
        
    is_ready = db_status == "ok" and redis_status == "ok"
    
    return {
        "ready": is_ready,
        "mongodb": db_status,
        "redis": redis_status,
        "timestamp": time.time()
    }
