from typing import TypedDict, Optional
from datetime import datetime, timezone
from bson import ObjectId

COLLECTION = "messages"

class MessageDoc(TypedDict):
    _id: str
    sender_id: str
    recipient_id: str
    content: Optional[str]
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    ciphertext_hex: Optional[str]
    encryption_lane: str
    threat_score: float
    signature_hex: Optional[str]
    is_read: bool
    created_at: datetime

def create_message_doc(
    sender_id: str,
    recipient_id: str,
    encryption_lane: str,
    threat_score: float,
    content: Optional[str] = None,
    file_url: Optional[str] = None,
    file_name: Optional[str] = None,
    file_size: Optional[int] = None,
    ciphertext_hex: Optional[str] = None,
    signature_hex: Optional[str] = None
) -> MessageDoc:
    return {
        "_id": str(ObjectId()),
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "content": content,
        "file_url": file_url,
        "file_name": file_name,
        "file_size": file_size,
        "ciphertext_hex": ciphertext_hex,
        "encryption_lane": encryption_lane,
        "threat_score": threat_score,
        "signature_hex": signature_hex,
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }
