from __future__ import annotations
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
import jwt
from datetime import datetime, timedelta
from loguru import logger

_ph = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return _ph.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its Argon2 hash."""
    try:
        return _ph.verify(hashed, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def create_jwt_token(user_id: str, username: str, secret: str, algorithm: str, expiry_minutes: int) -> str:
    """Create a signed JWT token for a user."""
    payload = {
        "sub": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(minutes=expiry_minutes),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_jwt_token(token: str, secret: str, algorithm: str) -> dict:
    """Decode and verify a JWT token. Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, secret, algorithms=[algorithm])
