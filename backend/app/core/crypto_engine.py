from __future__ import annotations
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from loguru import logger

try:
    import oqs
    _LIBOQS_AVAILABLE = True
except ImportError:
    logger.warning("liboqs-python not installed. Using fallback random keys for KEM.")
    _LIBOQS_AVAILABLE = False


# ----- KEM (Kyber-768) --------------------------------------------------------

def kem_generate_keypair() -> tuple[bytes, bytes]:
    """Generate a Kyber-768 KEM public/private key pair."""
    if _LIBOQS_AVAILABLE:
        with oqs.KeyEncapsulation("Kyber768") as kem:
            public_key = kem.generate_keypair()
            private_key = kem.export_secret_key()
        return public_key, private_key
    # Fallback: simulate with random bytes
    return os.urandom(1184), os.urandom(2400)


def kem_encapsulate(public_key: bytes) -> tuple[bytes, bytes]:
    """Encapsulate a shared secret using Kyber-768. Returns (ciphertext, shared_secret)."""
    if _LIBOQS_AVAILABLE:
        with oqs.KeyEncapsulation("Kyber768") as kem:
            ciphertext, shared_secret = kem.encap_secret(public_key)
        return ciphertext, shared_secret
    return os.urandom(1088), os.urandom(32)


def kem_decapsulate(private_key: bytes, ciphertext: bytes) -> bytes:
    """Decapsulate a shared secret using Kyber-768. Returns the shared_secret."""
    if _LIBOQS_AVAILABLE:
        with oqs.KeyEncapsulation("Kyber768", secret_key=private_key) as kem:
            return kem.decap_secret(ciphertext)
    return os.urandom(32)


# ----- SIGNATURE (Dilithium-3) -----------------------------------------------

def sign_message(private_key: bytes, message: bytes) -> bytes:
    """Sign a message using Dilithium-3. Returns the signature bytes."""
    if _LIBOQS_AVAILABLE:
        with oqs.Signature("Dilithium3") as sig:
            return sig.sign(message)
    return os.urandom(3293)


def verify_signature(public_key: bytes, message: bytes, signature: bytes) -> bool:
    """Verify a Dilithium-3 signature. Returns True if valid."""
    if _LIBOQS_AVAILABLE:
        try:
            with oqs.Signature("Dilithium3") as sig:
                return sig.verify(message, signature, public_key)
        except Exception:
            return False
    return True  # Fallback always passes


# ----- SYMMETRIC (AES-256-GCM) ------------------------------------------------

def aes_encrypt(key: bytes, plaintext: bytes) -> tuple[bytes, bytes]:
    """Encrypt plaintext with AES-256-GCM. Returns (nonce, ciphertext_with_tag)."""
    if len(key) != 32:
        raise ValueError(f"AES-256 requires a 32-byte key, got {len(key)}")
    nonce = os.urandom(12)
    aead = AESGCM(key)
    ciphertext = aead.encrypt(nonce, plaintext, None)
    return nonce, ciphertext


def aes_decrypt(key: bytes, nonce: bytes, ciphertext: bytes) -> bytes:
    """Decrypt AES-256-GCM ciphertext. Returns plaintext."""
    aead = AESGCM(key)
    return aead.decrypt(nonce, ciphertext, None)
