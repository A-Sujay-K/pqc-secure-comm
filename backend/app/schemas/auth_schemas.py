from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9]+$")
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=1, max_length=50)

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    avatar_color: str
    priority: int
    is_online: bool
    last_seen: Optional[datetime] = None
    created_at: datetime
