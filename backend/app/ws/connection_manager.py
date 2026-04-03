from __future__ import annotations
from typing import Dict
from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    """Manages active WebSocket connections, keyed by user_id."""

    def __init__(self) -> None:
        self._active: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        """Accept a new WebSocket connection and register it."""
        await websocket.accept()
        self._active[user_id] = websocket
        logger.info(f"WebSocket connected: user_id={user_id} (total={len(self._active)})")

    def disconnect(self, user_id: str) -> None:
        """Remove a disconnected user's WebSocket."""
        self._active.pop(user_id, None)
        logger.info(f"WebSocket disconnected: user_id={user_id} (total={len(self._active)})")

    async def send_to_user(self, user_id: str, data: dict) -> bool:
        """Send a JSON payload to a specific user. Returns False if user is offline."""
        ws = self._active.get(user_id)
        if not ws:
            return False
        try:
            await ws.send_json(data)
            return True
        except Exception as e:
            logger.warning(f"Failed to send to user {user_id}: {e}")
            self.disconnect(user_id)
            return False

    def is_online(self, user_id: str) -> bool:
        """Check if a user has an active connection."""
        return user_id in self._active

    @property
    def active_count(self) -> int:
        return len(self._active)


# Global singleton instance
manager = ConnectionManager()
