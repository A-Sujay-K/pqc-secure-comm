from __future__ import annotations
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import get_database
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.models.user import COLLECTION as USERS_COL, create_user_doc
from app.utils.security import hash_password, verify_password, create_jwt_token
from app.config import get_settings
from loguru import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Register a new user account."""
    # Check for duplicate username or email
    if await db[USERS_COL].find_one({"username": req.username}):
        raise HTTPException(status_code=409, detail="Username already taken")
    if await db[USERS_COL].find_one({"email": req.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = create_user_doc(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name,
    )
    await db[USERS_COL].insert_one(doc)
    logger.info(f"New user registered: {req.username}")

    return UserResponse(
        id=doc["_id"],
        username=doc["username"],
        email=doc["email"],
        display_name=doc["display_name"],
        avatar_color=doc["avatar_color"],
        priority=doc["priority"],
        is_online=doc["is_online"],
        created_at=doc["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Authenticate a user and return a JWT access token."""
    settings = get_settings()
    user = await db[USERS_COL].find_one({"username": req.username})
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_jwt_token(
        user_id=user["_id"],
        username=user["username"],
        secret=settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
        expiry_minutes=settings.JWT_EXPIRY_MINUTES,
    )
    return TokenResponse(access_token=token)
