import asyncio
import os
import random
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from argon2 import PasswordHasher
from bson import ObjectId

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://pqc_user:pqc_pass@localhost:27017/pqc_secure_comm?authSource=admin")

users = [
    {"username": "alice", "priority": 3, "display_name": "Alice Chen"},
    {"username": "bob", "priority": 5, "display_name": "Bob Smith"},
    {"username": "charlie", "priority": 7, "display_name": "Charlie Brown"},
    {"username": "diana", "priority": 9, "display_name": "Diana Prince"},
    {"username": "eve", "priority": 2, "display_name": "Eve Wilson"}
]

PALETTE = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", "#FFD433", "#FF338A"]

async def seed_users():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.pqc_secure_comm
    collection = db.users

    ph = PasswordHasher()
    password_hash = ph.hash("password123")
    
    for user in users:
        existing = await collection.find_one({"username": user["username"]})
        if not existing:
            user["_id"] = str(ObjectId())
            user["email"] = f"{user['username']}@demo.local"
            user["hashed_password"] = password_hash
            user["avatar_color"] = random.choice(PALETTE)
            user["is_online"] = False
            user["last_seen"] = None
            user["created_at"] = datetime.now(timezone.utc)
            await collection.insert_one(user)
            print(f"Inserted user: {user['username']}")
        else:
            print(f"User {user['username']} already exists, skipping.")

if __name__ == "__main__":
    asyncio.run(seed_users())
