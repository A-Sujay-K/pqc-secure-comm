import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
from app.ws.connection_manager import manager
from app.db.mongodb import get_database
from app.db.redis_client import get_redis
from app.services.telemetry_service import get_snapshot

router = APIRouter()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    db = get_database()
    redis_client = get_redis()
    
    await manager.connect_telemetry(websocket)
    
    try:
        while True:
            # 1. Gather telemetry snapshot
            snapshot = await get_snapshot(db, redis_client)
            
            # 2. Send to client in expected format
            from datetime import datetime, timezone
            await websocket.send_json({
                "type": "telemetry_update",
                "payload": snapshot,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            
            # 3. Wait 2 seconds
            await asyncio.sleep(2.0)
            
    except (WebSocketDisconnect, RuntimeError):
        logger.info("Telemetry WebSocket disconnected")
    except Exception as e:
        logger.error(f"Telemetry WebSocket error: {e}")
    finally:
        await manager.disconnect_telemetry(websocket)
