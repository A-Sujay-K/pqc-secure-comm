from typing import TypedDict, Any
from datetime import datetime, timezone
from bson import ObjectId

COLLECTION = "telemetry_events"

class TelemetryEventDoc(TypedDict):
    _id: str
    event_type: str
    payload: dict[str, Any]
    timestamp: datetime

def create_telemetry_event(event_type: str, payload: dict[str, Any]) -> TelemetryEventDoc:
    return {
        "_id": str(ObjectId()),
        "event_type": event_type,
        "payload": payload,
        "timestamp": datetime.now(timezone.utc)
    }
