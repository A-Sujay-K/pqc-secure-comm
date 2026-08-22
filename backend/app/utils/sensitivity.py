import os
from typing import Optional

EXTENSION_SCORES: dict[str, float] = {
    # Plain text: 0.10
    ".txt": 0.10, ".md": 0.10, ".csv": 0.10, ".log": 0.10,
    # Media files: 0.25
    ".jpg": 0.25, ".jpeg": 0.25, ".png": 0.25, ".gif": 0.25, ".mp3": 0.25, ".mp4": 0.25,
    # Documents: 0.45
    ".pdf": 0.45, ".doc": 0.45, ".docx": 0.45, ".xls": 0.45, ".xlsx": 0.45, ".ppt": 0.45,
    # Credentials: 0.85
    ".key": 0.85, ".pem": 0.85, ".p12": 0.85, ".pfx": 0.85, ".gpg": 0.85,
    ".env": 0.85, ".exe": 0.85, ".bin": 0.85, ".dll": 0.85, ".zip": 0.85,
    ".7z": 0.85, ".tar": 0.85
}

def get_sensitivity_score(filename: Optional[str], content: Optional[str] = None, high_security: bool = False) -> float:
    """
    Calculates the sensitivity score S in [0.0, 1.0] for the Threat Analyzer.
    """
    score = 0.10
    
    # 1. File extension check
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        score = max(score, EXTENSION_SCORES.get(ext, 0.25))

    # 2. Content keyword check
    if content:
        content_lower = content.lower()
        sensitive_keywords = ["password", "secret", "confidential", "key", "classified", "urgent", "private"]
        if any(keyword in content_lower for keyword in sensitive_keywords):
            score = max(score, 0.85)

    # 3. High security mode adds 0.40 boost (or overrides)
    if high_security:
        score = min(1.0, score + 0.40)

    return min(1.0, score)
