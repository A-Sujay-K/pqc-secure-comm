from __future__ import annotations
from fastapi import APIRouter
from app.services.telemetry_service import get_telemetry_snapshot
from app.schemas.telemetry_schemas import TelemetrySnapshot

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.get("/snapshot", response_model=TelemetrySnapshot)
async def telemetry_snapshot():
    """Return a real-time snapshot of the system's telemetry data."""
    return await get_telemetry_snapshot()
