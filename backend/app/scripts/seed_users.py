import asyncio
import random
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.config import get_settings
from app.utils.security import hash_password
from app.models.user import COLLECTION as USERS_COL

USERS = [
    {"username": "alice", "priority": 3, "display_name": "Alice Chen"},
    {"username": "bob", "priority": 5, "display_name": "Bob Smith"},
    {"username": "charlie", "priority": 7, "display_name": "Charlie Brown"},
    {"username": "diana", "priority": 9, "display_name": "Diana Prince"},
    {"username": "eve", "priority": 2, "display_name": "Eve Wilson"}
]

PALETTE = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", "#FFD433", "#FF338A"]

async def seed_users():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    collection = db[USERS_COL]

    password_hash = hash_password("password123")
    
    for u in USERS:
        existing = await collection.find_one({"username": u["username"]})
        if not existing:
            user_doc = {
                "_id": str(ObjectId()),
                "username": u["username"],
                "email": f"{u['username']}@demo.local",
                "display_name": u["display_name"],
                "priority": u["priority"],
                "hashed_password": password_hash,
                "avatar_color": random.choice(PALETTE),
                "is_online": False,
                "last_seen": None,
                "created_at": datetime.now(timezone.utc)
            }
            await collection.insert_one(user_doc)
            print(f"Inserted user: {u['username']} (Priority {u['priority']})")
        else:
            print(f"User {u['username']} already exists, skipping.")
            
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_users())
