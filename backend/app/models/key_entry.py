from __future__ import annotations
from typing import TypedDict, Optional
from datetime import datetime
from bson import ObjectId
import secrets

COLLECTION = "qkd_keys"


class QKDKeyDoc(TypedDict):
    _id: str
    key_hex: str          # 64 hex chars = 256 bits
    consumed: bool
    consumed_by_message_id: Optional[str]
    generated_at: datetime
    consumed_at: Optional[datetime]


def create_key_doc() -> dict:
    """Generate a new 256-bit QKD key document."""
    return {
        "_id": str(ObjectId()),
        "key_hex": secrets.token_hex(32),  # 32 bytes = 256 bits
        "consumed": False,
        "consumed_by_message_id": None,
        "generated_at": datetime.utcnow(),
        "consumed_at": None,
    }
