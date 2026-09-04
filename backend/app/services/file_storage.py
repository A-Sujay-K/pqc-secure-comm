import os
import uuid
import base64
from loguru import logger

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file_data_bytes: bytes, filename: str) -> str:
    """Save file bytes to disk and return a URL path."""
    ensure_upload_dir()
    ext = os.path.splitext(filename)[1] if filename else ''
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    
    with open(file_path, 'wb') as f:
        f.write(file_data_bytes)
    
    logger.info(f"Saved file: {filename} -> {unique_name} ({len(file_data_bytes)} bytes)")
    return f"/uploads/{unique_name}"
