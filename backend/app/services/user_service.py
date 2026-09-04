from app.models.user import COLLECTION as USERS_COL, create_user_doc
from app.schemas.auth_schemas import RegisterRequest
from app.utils.security import hash_password, verify_password
from datetime import datetime, timezone

async def create_user(db, register_data: RegisterRequest) -> dict:
    """
    Creates a new user document in MongoDB.
    """
    hashed = hash_password(register_data.password)
    user_doc = create_user_doc(
        username=register_data.username,
        email=register_data.email,
        hashed_password=hashed,
        display_name=register_data.display_name,
    )
    
    await db[USERS_COL].insert_one(user_doc)
    return user_doc

async def authenticate_user(db, username: str, password: str) -> dict | None:
    """
    Authenticates a user by username and password.
    """
    user = await db[USERS_COL].find_one({"username": username})
    if not user:
        return None
        
    if not verify_password(password, user["hashed_password"]):
        return None
        
    user["_id"] = str(user["_id"])
    return user

async def get_user_by_id(db, user_id: str) -> dict | None:
    """
    Retrieves a user by their _id string.
    """
    user = await db[USERS_COL].find_one({"_id": user_id})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def get_user_by_username(db, username: str) -> dict | None:
    """
    Retrieves a user by their username.
    """
    user = await db[USERS_COL].find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def set_online_status(db, redis_client, user_id: str, is_online: bool):
    """
    Updates the online status of a user in Redis and MongoDB.
    """
    now = datetime.now(timezone.utc)
    update_fields = {"is_online": is_online}
    if not is_online:
        update_fields["last_seen"] = now
        
    await db[USERS_COL].update_one(
        {"_id": user_id},
        {"$set": update_fields}
    )
    
    if is_online:
        await redis_client.sadd("online_users", user_id)
    else:
        await redis_client.srem("online_users", user_id)

async def get_all_users(db, exclude_id: str | None = None) -> list[dict]:
    """
    Retrieves all users, optionally excluding a specific user ID.
    Used for contact list generation.
    """
    query = {}
    if exclude_id:
        query = {"_id": {"$ne": exclude_id}}
        
    cursor = db[USERS_COL].find(query, {"hashed_password": 0})
    users = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        users.append(doc)
        
    return users
