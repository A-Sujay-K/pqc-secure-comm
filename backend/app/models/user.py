from __future__ import annotations
from typing import TypedDict, Optional
from datetime import datetime
from bson import ObjectId
import random

COLLECTION = "users"

AVATAR_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6",
]


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


def create_user_doc(
    username: str,
    email: str,
    hashed_password: str,
    display_name: str,
    priority: int = 5,
) -> dict:
    """Create a new user document with auto-generated fields."""
    now = datetime.utcnow()
    return {
        "_id": str(ObjectId()),
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "display_name": display_name,
        "avatar_color": random.choice(AVATAR_COLORS),
        "priority": priority,
        "is_online": False,
        "last_seen": None,
        "created_at": now,
    }
