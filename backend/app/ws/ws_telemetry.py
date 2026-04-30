from __future__ import annotations
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.telemetry_service import get_telemetry_snapshot
from loguru import logger

router = APIRouter(tags=["Telemetry WebSocket"])

_telemetry_clients: set[WebSocket] = set()


@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """Broadcast real-time telemetry snapshots to supervisor clients."""
    await websocket.accept()
    _telemetry_clients.add(websocket)
    logger.info(f"Telemetry WebSocket connected ({len(_telemetry_clients)} clients)")

    try:
        while True:
            snapshot = await get_telemetry_snapshot()
            await websocket.send_json(snapshot.model_dump())
            await asyncio.sleep(2)   # push update every 2 seconds
    except WebSocketDisconnect:
        _telemetry_clients.discard(websocket)
        logger.info(f"Telemetry WebSocket disconnected ({len(_telemetry_clients)} clients)")
    except Exception as e:
        logger.error(f"Telemetry WebSocket error: {e}")
        _telemetry_clients.discard(websocket)
