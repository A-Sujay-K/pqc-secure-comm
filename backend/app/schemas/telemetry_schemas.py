from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class KeyPoolMetric(BaseModel):
    total_generated: int
    available: int
    consumed: int
    generation_rate: float
    capacity: Optional[int] = 20
    availability_ratio: Optional[float] = 1.0

class QueueStatus(BaseModel):
    depth: int
    oldest_entry_age_seconds: Optional[float] = None
    deadline_seconds: Optional[float] = 5.0
    pending_messages: List[Dict[str, Any]] = []

class RoutingStats(BaseModel):
    total_messages: int
    standard_lane_count: int
    critical_lane_count: int
    avg_threat_score: float
    delivered_messages: Optional[int] = None
    failed_messages: Optional[int] = None
    mdr_percent: Optional[float] = None

class TelemetrySnapshot(BaseModel):
    key_pool: KeyPoolMetric
    queue: QueueStatus
    routing: RoutingStats
    active_connections: int
    uptime_seconds: float
    recent_events: List[Dict[str, Any]]
