import os
import re
import math
import zlib
from typing import Optional

# Base file extension risk levels
EXTENSION_SCORES: dict[str, float] = {
    # Plain text / logs: 0.10 - 0.22
    ".txt": 0.12, ".md": 0.14, ".csv": 0.18, ".log": 0.22,
    # Media files: 0.20 - 0.28
    ".jpg": 0.22, ".jpeg": 0.22, ".png": 0.25, ".gif": 0.20, ".mp3": 0.22, ".mp4": 0.28,
    # Documents / spreadsheets: 0.40 - 0.52
    ".pdf": 0.46, ".doc": 0.42, ".docx": 0.45, ".xls": 0.48, ".xlsx": 0.52, ".ppt": 0.40, ".pptx": 0.42,
    # Code & configuration: 0.30 - 0.70
    ".json": 0.30, ".yaml": 0.35, ".yml": 0.35, ".xml": 0.30, ".sql": 0.65, ".sh": 0.70, ".ps1": 0.70,
    # High risk / credentials & archives: 0.75 - 0.95
    ".key": 0.95, ".pem": 0.92, ".p12": 0.94, ".pfx": 0.94, ".gpg": 0.90,
    ".env": 0.92, ".exe": 0.85, ".bin": 0.82, ".dll": 0.85, ".zip": 0.75,
    ".7z": 0.78, ".tar": 0.75, ".gz": 0.75
}

# Weighted keywords for continuous threat evaluation
KEYWORD_WEIGHTS: dict[str, float] = {
    # Critical / High-Value Cryptographic & Security Credentials (0.84 - 0.96)
    "private key": 0.96,
    "seed phrase": 0.96,
    "top secret": 0.94,
    "master key": 0.94,
    "root password": 0.94,
    "passphrase": 0.90,
    "api_key": 0.90,
    "apikey": 0.90,
    "secret_key": 0.90,
    "access_token": 0.88,
    "private_key": 0.96,
    "classified": 0.90,
    "password": 0.86,
    "secret": 0.84,
    "credential": 0.86,
    "credentials": 0.86,
    "token": 0.80,
    "urgent": 0.78,
    "confidential": 0.84,
    "auth token": 0.86,
    "private": 0.74,
    "restricted": 0.76,
    "vulnerability": 0.76,
    "exploit": 0.80,
    "cve": 0.74,

    # Medium Sensitivity / Corporate, Financial & Regulated Data (0.42 - 0.65)
    "financial": 0.56,
    "salary": 0.58,
    "payroll": 0.58,
    "invoice": 0.52,
    "banking": 0.58,
    "tax": 0.52,
    "contract": 0.52,
    "nda": 0.56,
    "patent": 0.54,
    "audit": 0.50,
    "proprietary": 0.56,
    "internal": 0.44,
    "compliance": 0.46,
    "customer data": 0.62,
    "ssn": 0.65,
    "intellectual property": 0.60,
    "revenue": 0.50,
    "budget": 0.48,

    # Low Sensitivity / Routine Communication & Coordination (0.10 - 0.20)
    "meeting": 0.16,
    "schedule": 0.18,
    "update": 0.15,
    "status": 0.15,
    "agenda": 0.16,
    "notes": 0.14,
    "sync": 0.15,
    "review": 0.16,
    "draft": 0.15,
    "lunch": 0.12,
    "coffee": 0.12,
    "hello": 0.12,
    "thanks": 0.10,
    "public": 0.10,
    "discussion": 0.14
}

# Regex patterns for high-risk structured secrets
SECRET_PATTERNS = [
    (re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'), 0.96),
    (re.compile(r'eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}'), 0.92),  # JWT
    (re.compile(r'(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{20,}'), 0.94),      # API keys
    (re.compile(r'AKIA[0-9A-Z]{16}'), 0.92),                                # AWS Access Key
    (re.compile(r'(?i)(?:password|passwd|pwd|secret)\s*[:=]\s*\S+'), 0.88), # Credential assignment
    (re.compile(r'\b[0-9a-fA-F]{32,64}\b'), 0.82),                         # Hex cryptographic hashes / keys
]

# Legacy keyword lists for backwards compatibility with any external modules
HIGH_SENSITIVITY_KEYWORDS = [k for k, w in KEYWORD_WEIGHTS.items() if w >= 0.70]
MEDIUM_SENSITIVITY_KEYWORDS = [k for k, w in KEYWORD_WEIGHTS.items() if 0.35 <= w < 0.70]
LOW_SENSITIVITY_KEYWORDS = [k for k, w in KEYWORD_WEIGHTS.items() if w < 0.35]

def compute_shannon_entropy(text: str) -> float:
    """Calculates Shannon entropy in bits per character."""
    if not text:
        return 0.0
    freq: dict[str, int] = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    length = len(text)
    return -sum((count / length) * math.log2(count / length) for count in freq.values())

def get_sensitivity_score(
    filename: Optional[str] = None, 
    content: Optional[str] = None, 
    high_security: bool = False,
    file_data: Optional[bytes] = None
) -> float:
    """
    Dynamically computes the sensitivity score S in [0.05, 1.0] for the Threat Analyzer.
    Evaluates:
      1. Multi-tiered weighted keywords with compound multi-match accumulation
      2. Regex pattern recognition for structured secrets (API keys, JWT, PEM headers)
      3. Shannon entropy of text (detecting ciphertexts, hashes, passwords)
      4. File extension risk level and binary size factor
      5. Deterministic content hash modulation for nuanced per-message variance
      6. Explicit High Security override mode
    """
    if not content and not filename and not file_data:
        return 0.95 if high_security else 0.10

    # 1. Base content analysis
    matched_weights: list[float] = []
    text_content = content or ""
    content_lower = text_content.lower()

    if text_content:
        # Check weighted keywords
        for keyword, weight in KEYWORD_WEIGHTS.items():
            if keyword in content_lower:
                matched_weights.append(weight)

        # Check regex patterns
        for pattern, weight in SECRET_PATTERNS:
            if pattern.search(text_content):
                matched_weights.append(weight)

    # Calculate baseline from keyword / pattern matches
    if matched_weights:
        matched_weights.sort(reverse=True)
        primary_weight = matched_weights[0]
        # Diminishing compounding contribution from additional matches
        compound_bonus = sum(w / 15.0 for w in matched_weights[1:])
        base_s = min(0.96, primary_weight + compound_bonus)
    else:
        # Default baseline for neutral text scaled lightly by word count / length
        base_s = 0.10 + min(0.08, len(text_content) / 200.0 * 0.08)

    # 2. Shannon entropy factor (passwords, base64 tokens, cryptographic hashes have high entropy)
    if len(text_content) >= 8:
        entropy = compute_shannon_entropy(text_content)
        # Typical English text has entropy ~3.0 - 4.0; higher diversity signals keys/hashes
        if entropy > 3.6:
            entropy_boost = min(0.08, (entropy - 3.6) * 0.05)
            base_s = min(0.97, base_s + entropy_boost)

    # 3. File extension & file size analysis
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        file_risk = EXTENSION_SCORES.get(ext, 0.25)
        if base_s < file_risk:
            base_s = file_risk
        else:
            base_s = min(0.97, base_s + (file_risk / 12.0))

    if file_data:
        size_mb = len(file_data) / (1024 * 1024)
        size_factor = min(0.06, size_mb * 0.01)
        base_s = min(0.98, base_s + size_factor)

    # 4. Deterministic lexical CRC modulation for unique per-message fingerprint
    # Ensures every message has a distinct, reproducible score reflecting exact wording
    if text_content:
        crc = zlib.crc32(text_content.encode('utf-8'))
        crc_variation = ((crc % 1000) / 1000.0) * 0.04 - 0.02
        base_s = base_s + crc_variation
    elif filename:
        crc = zlib.crc32(filename.encode('utf-8'))
        crc_variation = ((crc % 1000) / 1000.0) * 0.04 - 0.02
        base_s = base_s + crc_variation

    # 5. High security mode override (user explicitly toggled BB84 QKD Critical mode)
    if high_security:
        crc_val = zlib.crc32((text_content or filename or 'high_security').encode('utf-8'))
        hs_var = ((crc_val % 1000) / 1000.0) * 0.04 - 0.02
        base_s = max(base_s, 0.92 + hs_var)

    return round(max(0.05, min(0.99, base_s)), 4)
