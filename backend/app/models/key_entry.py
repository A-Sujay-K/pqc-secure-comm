from typing import TypedDict, Optional
from datetime import datetime, timezone
from bson import ObjectId

COLLECTION = "qkd_keys"

class QKDKeyDoc(TypedDict):
    _id: str
    key_hex: str
    consumed: bool
    consumed_by_message_id: Optional[str]
    generated_at: datetime
    consumed_at: Optional[datetime]

def create_key_doc(key_hex: str) -> QKDKeyDoc:
    return {
        "_id": str(ObjectId()),
        "key_hex": key_hex,
        "consumed": False,
        "consumed_by_message_id": None,
        "generated_at": datetime.now(timezone.utc),
        "consumed_at": None
    }
