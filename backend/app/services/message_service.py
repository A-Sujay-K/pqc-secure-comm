from app.models.message import COLLECTION as MESSAGES_COL

async def save_message(db, message_doc: dict) -> str:
    """
    Saves a chat message to MongoDB.
    Returns the document _id as string.
    """
    result = await db[MESSAGES_COL].insert_one(message_doc)
    return str(message_doc.get("_id", result.inserted_id))

async def get_message_history(db, user_id: str, peer_id: str, page: int = 1, per_page: int = 50) -> tuple[list[dict], int]:
    """
    Retrieves paginated message history between two users.
    Returns (messages_list, total_count).
    """
    query = {
        "$or": [
            {"sender_id": user_id, "recipient_id": peer_id},
            {"sender_id": peer_id, "recipient_id": user_id}
        ]
    }
    
    skip = (page - 1) * per_page
    
    cursor = db[MESSAGES_COL].find(query).sort("created_at", -1).skip(skip).limit(per_page)
    messages = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]  # Add id alias for frontend compatibility
        messages.append(doc)
        
    total_count = await db[MESSAGES_COL].count_documents(query)
    
    # Reverse to chronological order for display
    messages.reverse()
    
    return messages, total_count

async def mark_as_read(db, message_ids: list[str]) -> int:
    """
    Marks specific messages as read by their _id.
    """
    if not message_ids:
        return 0
        
    result = await db[MESSAGES_COL].update_many(
        {"_id": {"$in": message_ids}},
        {"$set": {"is_read": True}}
    )
    return result.modified_count

async def get_unread_count(db, user_id: str) -> dict[str, int]:
    """
    Aggregates unread message counts grouped by sender.
    """
    pipeline = [
        {"$match": {"recipient_id": user_id, "is_read": False}},
        {"$group": {"_id": "$sender_id", "count": {"$sum": 1}}}
    ]
    
    counts = {}
    async for doc in db[MESSAGES_COL].aggregate(pipeline):
        counts[doc["_id"]] = doc["count"]
        
    return counts
