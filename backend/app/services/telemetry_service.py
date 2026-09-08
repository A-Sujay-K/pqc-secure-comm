import time
from datetime import datetime, timezone, timedelta
from app.models.telemetry_event import create_telemetry_event, COLLECTION as TELEMETRY_COL
from app.services.key_pool_service import get_pool_stats
from app.core.priority_queue import get_queue_depth, get_queue_entries
from app.ws.connection_manager import manager as connection_manager
from app.config import get_settings

_start_time = time.time()

async def record_event(db, event_type: str, payload: dict):
    """
    Records a telemetry event to MongoDB and broadcasts to supervisor dashboard.
    """
    event_doc = create_telemetry_event(event_type=event_type, payload=payload)
    await db[TELEMETRY_COL].insert_one(event_doc)
    
    # Broadcast to telemetry WebSocket subscribers
    try:
        broadcast_data = {
            "type": "telemetry_event",
            "payload": {
                "event_type": event_type,
                "payload": payload,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }
        await connection_manager.broadcast_telemetry(broadcast_data)
    except Exception:
        pass  # Don't let telemetry broadcasting failures affect core operations

async def get_routing_stats(db, minutes: int = 60) -> dict:
    """
    Aggregates routing statistics and Message Delivery Ratio (MDR) over the last N minutes.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    
    pipeline = [
        {"$match": {
            "event_type": {"$in": ["routing_decision", "delivery_failure"]},
            "timestamp": {"$gte": cutoff},
        }},
        {"$group": {
            "_id": {
                "event_type": "$event_type",
                "lane": "$payload.lane"
            },
            "count": {"$sum": 1},
            "avg_threat": {"$avg": "$payload.threat_score"},
        }}
    ]
    
    total = 0
    standard_count = 0
    critical_count = 0
    failure_count = 0
    threat_sum = 0.0
    threat_count = 0
    
    async for doc in db[TELEMETRY_COL].aggregate(pipeline):
        count = doc["count"]
        ev_type = doc["_id"]["event_type"]
        lane = doc["_id"].get("lane")
        
        if ev_type == "delivery_failure":
            failure_count += count
        else:
            total += count
            if lane == "standard":
                standard_count += count
            elif lane == "critical":
                critical_count += count
            if doc.get("avg_threat") is not None:
                threat_sum += doc["avg_threat"] * count
                threat_count += count
                
    avg_threat = (threat_sum / threat_count) if threat_count > 0 else 0.0
    delivered = max(0, total - failure_count)
    mdr = round((delivered / total * 100.0), 2) if total > 0 else 100.0
    
    return {
        "total_messages": total,
        "delivered_messages": delivered,
        "failed_messages": failure_count,
        "mdr_percent": mdr,
        "standard_lane_count": standard_count,
        "critical_lane_count": critical_count,
        "avg_threat_score": round(avg_threat, 4),
    }

async def get_snapshot(db, redis_client) -> dict:
    """
    Generates a comprehensive snapshot of system telemetry for the supervisor dashboard.
    """
    settings = get_settings()
    key_stats = await get_pool_stats(db, redis_client)
    queue_depth = await get_queue_depth(redis_client)
    queue_entries = await get_queue_entries(redis_client, limit=10)
    routing_stats = await get_routing_stats(db, 60)
    active_connections = connection_manager.get_connection_count()
    uptime = time.time() - _start_time
    
    oldest_age = None
    if queue_entries:
        wait_times = [e["message"].get("wait_time", 0.0) for e in queue_entries if "wait_time" in e.get("message", {})]
        if wait_times:
            oldest_age = max(wait_times)
            
    # Get recent events (last 25)
    recent_events = []
    cursor = db[TELEMETRY_COL].find().sort("timestamp", -1).limit(25)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
        recent_events.append(doc)
        
    avail = key_stats.get("available", 0)
    k_max = settings.K_MAX if settings.K_MAX > 0 else 20
    
    return {
        "key_pool": {
            "total_generated": key_stats.get("total_generated", 0),
            "available": avail,
            "consumed": key_stats.get("consumed", 0),
            "capacity": k_max,
            "availability_ratio": round(avail / k_max, 4),
            "generation_rate": round(key_stats.get("total_generated", 0) / max(uptime / 60, 1), 2),
        },
        "queue": {
            "depth": queue_depth,
            "oldest_entry_age_seconds": oldest_age,
            "deadline_seconds": settings.DELIVERY_DEADLINE,
            "pending_messages": queue_entries,
        },
        "routing": routing_stats,
        "active_connections": active_connections,
        "uptime_seconds": round(uptime, 1),
        "recent_events": recent_events,
    }
