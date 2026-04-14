from __future__ import annotations
from typing import TypedDict
from datetime import datetime
from bson import ObjectId

COLLECTION = "telemetry_events"


class TelemetryEventDoc(TypedDict):
    _id: str
    event_type: str
    payload: dict
    timestamp: datetime


def create_telemetry_event(event_type: str, payload: dict) -> dict:
    """Create a new telemetry event document."""
    return {
        "_id": str(ObjectId()),
        "event_type": event_type,
        "payload": payload,
        "timestamp": datetime.utcnow(),
    }
