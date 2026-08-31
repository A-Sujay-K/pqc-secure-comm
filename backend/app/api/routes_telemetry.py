from fastapi import APIRouter, Depends, Query
from app.services.telemetry_service import get_snapshot
from app.db.mongodb import get_database
from app.db.redis_client import get_redis
from app.models.telemetry_event import COLLECTION as TELEMETRY_COL

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/snapshot")
async def fetch_snapshot():
    db = get_database()
    redis_client = get_redis()
    snapshot = await get_snapshot(db, redis_client)
    return snapshot

@router.get("/events")
async def fetch_events(
    limit: int = Query(50, ge=1, le=200),
    event_type: str | None = None
):
    db = get_database()
    query = {}
    if event_type:
        query["event_type"] = event_type
        
    cursor = db[TELEMETRY_COL].find(query).sort("timestamp", -1).limit(limit)
    events = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        events.append(doc)
        
    return events
