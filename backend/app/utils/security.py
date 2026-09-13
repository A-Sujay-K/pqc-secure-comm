from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from datetime import datetime, timedelta, timezone
from app.config import get_settings, Settings

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Hashes a password using Argon2."""
    return ph.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a password against its hash."""
    try:
        ph.verify(hashed, password)
        return True
    except VerifyMismatchError:
        return False

def create_jwt_token(user_id: str, username: str, settings: Settings | None = None) -> str:
    """Creates a JWT access token. Settings are auto-resolved if not provided."""
    if settings is None:
        settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    to_encode = {"exp": expire, "sub": user_id, "username": username}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_jwt_token(token: str, settings: Settings | None = None) -> dict | None:
    """Decodes and verifies a JWT token. Returns payload dict or None on failure."""
    if settings is None:
        settings = get_settings()
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
