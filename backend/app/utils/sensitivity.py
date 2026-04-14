from __future__ import annotations

EXTENSION_SCORES: dict[str, float] = {
    # Low sensitivity
    ".txt": 0.1, ".md": 0.1, ".csv": 0.15, ".log": 0.1,
    # Medium
    ".jpg": 0.3, ".jpeg": 0.3, ".png": 0.3, ".gif": 0.25,
    ".mp3": 0.3, ".mp4": 0.35,
    # High
    ".pdf": 0.5, ".doc": 0.55, ".docx": 0.55,
    ".xls": 0.55, ".xlsx": 0.55, ".ppt": 0.5,
    # Critical
    ".key": 0.8, ".pem": 0.9, ".p12": 0.85, ".pfx": 0.85,
    ".gpg": 0.8, ".env": 0.75, ".exe": 0.7, ".bin": 0.65,
    ".dll": 0.65, ".zip": 0.5, ".7z": 0.55, ".tar": 0.5,
}

_HIGH_SECURITY_BOOST = 0.4


def get_sensitivity_score(filename: str | None, high_security: bool = False) -> float:
    """
    Compute the sensitivity score for a message.

    Args:
        filename: The name of an attached file, or None for text-only messages.
        high_security: If True, adds a 0.4 boost (capped at 1.0).

    Returns:
        A float in [0.0, 1.0].
    """
    if filename is None:
        base = 0.5 if high_security else 0.1
        return min(base, 1.0)

    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    base = EXTENSION_SCORES.get(ext, 0.3)

    if high_security:
        base = min(base + _HIGH_SECURITY_BOOST, 1.0)

    return base
