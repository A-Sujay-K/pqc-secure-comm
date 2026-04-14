from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class WSIncomingMessage(BaseModel):
    type: Literal["chat_message", "typing_start", "typing_stop", "read_receipt"]
    recipient_id: str
    content: Optional[str] = None
    file_data: Optional[str] = None   # base64-encoded file content
    file_name: Optional[str] = None
    high_security: bool = False


class WSOutgoingMessage(BaseModel):
    type: str
    payload: dict
    timestamp: datetime


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    encryption_lane: str
    threat_score: float
    is_read: bool
    created_at: datetime


class MessageHistoryRequest(BaseModel):
    peer_id: str
    page: int = 1
    per_page: int = 50
