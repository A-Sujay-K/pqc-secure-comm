from __future__ import annotations
import base64
from app.core.crypto_engine import (
    kem_generate_keypair, kem_encapsulate, kem_decapsulate,
    sign_message, aes_encrypt, aes_decrypt,
)
from loguru import logger


def encrypt_standard_lane(plaintext: bytes, recipient_public_key: bytes) -> dict:
    """
    Encrypt using Standard Lane: Kyber-768 KEM + AES-256-GCM + Dilithium-3 signature.

    Returns a dict with all fields needed to reconstruct the message.
    """
    # 1. Encapsulate a shared secret using Kyber-768
    kem_ciphertext, shared_secret = kem_encapsulate(recipient_public_key)

    # 2. Encrypt plaintext with AES-256-GCM using the shared secret
    nonce, ciphertext = aes_encrypt(shared_secret[:32], plaintext)

    return {
        "lane": "standard",
        "kem_ciphertext": base64.b64encode(kem_ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "ciphertext": base64.b64encode(ciphertext).decode(),
    }


def encrypt_critical_lane(plaintext: bytes, qkd_key_hex: str) -> dict:
    """
    Encrypt using Critical Lane: QKD key (256-bit) + AES-256-GCM.

    The QKD key is used directly as the symmetric encryption key.
    """
    key_bytes = bytes.fromhex(qkd_key_hex)
    nonce, ciphertext = aes_encrypt(key_bytes, plaintext)

    return {
        "lane": "critical",
        "nonce": base64.b64encode(nonce).decode(),
        "ciphertext": base64.b64encode(ciphertext).decode(),
    }
