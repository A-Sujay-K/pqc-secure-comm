from __future__ import annotations
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.ws.connection_manager import manager
from app.utils.security import decode_jwt_token
from app.config import get_settings
from loguru import logger

router = APIRouter(tags=["WebSocket"])


async def _get_user_id_from_token(token: str) -> str | None:
    settings = get_settings()
    try:
        payload = decode_jwt_token(token, settings.JWT_SECRET, settings.JWT_ALGORITHM)
        return payload.get("sub")
    except Exception:
        return None


@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, token: str = ""):
    user_id = await _get_user_id_from_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "chat_message":
                recipient_id = data.get("recipient_id")
                # Route message through crypto pipeline (stubs for now)
                await manager.send_to_user(recipient_id or "", {
                    "type": "chat_message",
                    "sender_id": user_id,
                    "content": data.get("content", ""),
                })

            elif msg_type == "typing_start":
                await manager.send_to_user(data.get("recipient_id", ""), {
                    "type": "typing_start",
                    "user_id": user_id,
                })

            elif msg_type == "typing_stop":
                await manager.send_to_user(data.get("recipient_id", ""), {
                    "type": "typing_stop",
                    "user_id": user_id,
                })

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"Chat WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"Chat WebSocket error for {user_id}: {e}")
        manager.disconnect(user_id)
