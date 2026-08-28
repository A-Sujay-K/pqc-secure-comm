from typing import TypedDict, Optional
from datetime import datetime, timezone
import random
from bson import ObjectId

COLLECTION = "users"

class UserDoc(TypedDict):
    _id: str
    username: str
    email: str
    hashed_password: str
    display_name: str
    avatar_color: str
    priority: int
    is_online: bool
    last_seen: Optional[datetime]
    created_at: datetime

PALETTE = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", "#FFD433", "#FF338A"]

def create_user_doc(username: str, email: str, hashed_password: str, display_name: str, priority: int = 5) -> UserDoc:
    return {
        "_id": str(ObjectId()),
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "display_name": display_name,
        "avatar_color": random.choice(PALETTE),
        "priority": priority,
        "is_online": False,
        "last_seen": None,
        "created_at": datetime.now(timezone.utc)
    }
