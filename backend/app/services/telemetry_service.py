from __future__ import annotations
import time
from app.db.mongodb import get_database
from app.services.key_pool_service import get_available_key_count
from app.core.priority_queue import get_queue_depth
from app.models.message import COLLECTION as MESSAGES_COL
from app.models.key_entry import COLLECTION as KEYS_COL
from app.ws.connection_manager import manager
from app.schemas.telemetry_schemas import TelemetrySnapshot, KeyPoolMetric, QueueStatus, RoutingStats
from loguru import logger

_start_time = time.time()


async def get_telemetry_snapshot() -> TelemetrySnapshot:
    """Build a comprehensive telemetry snapshot of the system state."""
    db = get_database()

    # Key pool metrics
    available_keys = await get_available_key_count()
    total_generated = await db[KEYS_COL].count_documents({})
    total_consumed = await db[KEYS_COL].count_documents({"consumed": True})

    key_pool = KeyPoolMetric(
        total_generated=total_generated,
        available=available_keys,
        consumed=total_consumed,
        generation_rate=6.0,  # 1 key per 10s = 6 per minute
    )

    # Queue status
    queue_depth = await get_queue_depth()
    queue_status = QueueStatus(depth=queue_depth)

    # Routing stats
    total_msgs = await db[MESSAGES_COL].count_documents({})
    standard_count = await db[MESSAGES_COL].count_documents({"encryption_lane": "standard"})
    critical_count = await db[MESSAGES_COL].count_documents({"encryption_lane": "critical"})

    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$threat_score"}}}]
    result = await db[MESSAGES_COL].aggregate(pipeline).to_list(1)
    avg_threat = result[0]["avg"] if result else 0.0

    routing = RoutingStats(
        total_messages=total_msgs,
        standard_lane_count=standard_count,
        critical_lane_count=critical_count,
        avg_threat_score=round(avg_threat, 4),
    )

    return TelemetrySnapshot(
        key_pool=key_pool,
        queue=queue_status,
        routing=routing,
        active_connections=manager.active_count,
        uptime_seconds=round(time.time() - _start_time, 1),
    )
