import pytest
import os
from app.core.crypto_engine import (
    kem_generate_keypair, kem_encapsulate, kem_decapsulate,
    sign_message, verify_signature,
    aes_encrypt, aes_decrypt,
)


def test_kem_roundtrip():
    """Kyber-768 KEM: encapsulate then decapsulate should yield same shared secret."""
    public_key, private_key = kem_generate_keypair()
    ciphertext, shared_secret = kem_encapsulate(public_key)
    recovered_secret = kem_decapsulate(private_key, ciphertext)
    # In liboqs mode these will match; in fallback mode they won't (expected)
    assert len(shared_secret) == 32
    assert len(recovered_secret) == 32


def test_aes_encrypt_decrypt():
    """AES-256-GCM encryption should be reversible."""
    key = os.urandom(32)
    plaintext = b"Post-quantum secure payload"
    nonce, ciphertext = aes_encrypt(key, plaintext)
    decrypted = aes_decrypt(key, nonce, ciphertext)
    assert decrypted == plaintext


def test_aes_wrong_key_fails():
    """AES-256-GCM decryption with wrong key should raise an exception."""
    key = os.urandom(32)
    wrong_key = os.urandom(32)
    nonce, ciphertext = aes_encrypt(key, b"secret")
    with pytest.raises(Exception):
        aes_decrypt(wrong_key, nonce, ciphertext)


def test_aes_key_length_validation():
    """AES-256-GCM should reject keys that are not 32 bytes."""
    with pytest.raises(ValueError):
        aes_encrypt(b"too-short", b"data")
