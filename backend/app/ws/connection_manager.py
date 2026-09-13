from typing import Dict, Set
from fastapi import WebSocket
from loguru import logger
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.telemetry_connections: Set[WebSocket] = set()

    async def connect_user(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket.")
        # Broadcast online status could go here

    async def disconnect_user(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket.")

    async def connect_telemetry(self, websocket: WebSocket):
        await websocket.accept()
        self.telemetry_connections.add(websocket)
        logger.info(f"Telemetry client connected. Total: {len(self.telemetry_connections)}")

    async def disconnect_telemetry(self, websocket: WebSocket):
        if websocket in self.telemetry_connections:
            self.telemetry_connections.remove(websocket)
            logger.info("Telemetry client disconnected.")

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send to user {user_id}: {e}")
                await self.disconnect_user(user_id)

    async def broadcast_telemetry(self, event: dict):
        dead_connections = set()
        for websocket in self.telemetry_connections:
            try:
                await websocket.send_json(event)
            except Exception:
                dead_connections.add(websocket)
                
        for ws in dead_connections:
            self.telemetry_connections.remove(ws)

    async def broadcast_user_status(self, user_id: str, is_online: bool):
        """Broadcast user online/offline status to all connected users."""
        status_msg = {
            "type": "user_status",
            "payload": {"user_id": user_id, "is_online": is_online}
        }
        for uid, ws in list(self.active_connections.items()):
            if uid != user_id:
                try:
                    await ws.send_json(status_msg)
                except Exception:
                    pass

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected chat users."""
        for uid, ws in list(self.active_connections.items()):
            try:
                await ws.send_json(message)
            except Exception:
                pass

    def get_online_users(self) -> list[str]:
        return list(self.active_connections.keys())

    def get_connection_count(self) -> int:
        return len(self.active_connections)

# Singleton
manager = ConnectionManager()
