from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel


class KeyPoolMetric(BaseModel):
    total_generated: int
    available: int
    consumed: int
    generation_rate: float   # keys per minute


class QueueStatus(BaseModel):
    depth: int
    oldest_entry_age_seconds: Optional[float] = None
    pending_messages: List[dict] = []


class RoutingStats(BaseModel):
    total_messages: int
    standard_lane_count: int
    critical_lane_count: int
    avg_threat_score: float


class TelemetrySnapshot(BaseModel):
    key_pool: KeyPoolMetric
    queue: QueueStatus
    routing: RoutingStats
    active_connections: int
    uptime_seconds: float
    recent_events: List[dict] = []
