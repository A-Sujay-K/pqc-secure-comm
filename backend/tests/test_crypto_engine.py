import pytest
import os
from app.core.crypto_engine import aes_gcm_encrypt, aes_gcm_decrypt, encrypt_standard_lane, encrypt_critical_lane

def test_aes_gcm_roundtrip():
    key = os.urandom(32)
    plaintext = b"Test secret message"
    
    nonce, ciphertext, tag = aes_gcm_encrypt(key, plaintext)
    decrypted = aes_gcm_decrypt(key, nonce, ciphertext, tag)
    
    assert decrypted == plaintext

def test_aes_invalid_key_size():
    key = os.urandom(16)
    plaintext = b"Test"
    with pytest.raises(ValueError):
        aes_gcm_encrypt(key, plaintext)

def test_encrypt_standard_lane():
    plaintext = b"Test standard payload"
    result = encrypt_standard_lane(plaintext)
    
    assert "kem_public_key" in result
    assert "kem_ciphertext" in result
    assert "nonce" in result
    assert "ciphertext" in result
    assert "tag" in result
    assert "sig_public_key" in result
    assert "signature" in result

def test_encrypt_critical_lane():
    plaintext = b"Test critical payload"
    qkd_key = os.urandom(32).hex()
    
    result = encrypt_critical_lane(plaintext, qkd_key)
    
    assert "qkd_key_id" in result
    assert "nonce" in result
    assert "ciphertext" in result
    assert "tag" in result
    assert "sig_public_key" in result
    assert "signature" in result
