from __future__ import annotations
import os
import uuid
import aiofiles
from fastapi import UploadFile
from loguru import logger

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


async def save_upload(file: UploadFile) -> tuple[str, str, int]:
    """
    Save an uploaded file to the uploads directory.
    Returns (file_url, file_name, file_size_bytes).
    """
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size {file_size} exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES}")

    ext = os.path.splitext(file.filename or "file")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    logger.info(f"Saved upload: {file.filename} -> {stored_name} ({file_size} bytes)")
    return f"/uploads/{stored_name}", file.filename or stored_name, file_size
