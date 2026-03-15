"""Unit tests for security utilities."""
import pytest
from datetime import datetime, timedelta
from src.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)


class TestSecurityUtilities:
    """Test suite for security utility functions."""

    def test_create_access_token_with_email(self):
        """Test that create_access_token includes email in the payload."""
        user_id = "test-user-id-123"
        email = "test@example.com"
        
        token = create_access_token(
            data={"user_id": user_id, "email": email},
            expires_delta=timedelta(hours=1)
        )
        
        assert token is not None
        assert isinstance(token, str)
        
        # Decode and verify claims
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["user_id"] == user_id
        assert payload["email"] == email
        assert "exp" in payload
        assert "iat" in payload, "Token should include 'iat' (issued at) claim"

    def test_decode_access_token_with_email(self):
        """Test that decode_access_token properly extracts email from token."""
        user_id = "test-user-id-456"
        email = "user@example.com"
        
        # Create token with email
        token = create_access_token(
            data={"user_id": user_id, "email": email},
            expires_delta=timedelta(hours=1)
        )
        
        # Decode and verify email is extracted
        payload = decode_access_token(token)
        
        assert payload is not None
        assert payload["email"] == email
        assert payload["user_id"] == user_id

    def test_password_hashing(self):
        """Test that password hashing produces secure hashes."""
        password = "SecurePassword123!"
        
        # Hash the password
        hashed = get_password_hash(password)
        
        assert hashed is not None
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        assert hashed != password  # Hash should not equal plain password
        assert hashed.startswith("$2")  # bcrypt hashes start with $2

    def test_password_verification(self):
        """Test password verification against hash."""
        password = "MySecurePassword123!"
        
        # Hash the password
        hashed = get_password_hash(password)
        
        # Verify correct password
        assert verify_password(password, hashed) is True
        
        # Verify incorrect password fails
        assert verify_password("WrongPassword123!", hashed) is False
        assert verify_password("", hashed) is False
        assert verify_password(password + "extra", hashed) is False

    def test_password_hashing_different_hashes_same_password(self):
        """Test that same password produces different hashes (due to salt)."""
        password = "SamePassword123!"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to random salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_decode_invalid_token_returns_none(self):
        """Test that decoding an invalid token returns None."""
        invalid_token = "invalid.token.here"
        
        result = decode_access_token(invalid_token)
        assert result is None

    def test_decode_expired_token_returns_none(self):
        """Test that decoding an expired token returns None."""
        # Create token that expired 1 hour ago
        expired_delta = timedelta(hours=-1)
        
        token = create_access_token(
            data={"user_id": "test", "email": "test@example.com"},
            expires_delta=expired_delta
        )
        
        result = decode_access_token(token)
        # Note: jose.jwt.decode may raise exception for expired tokens
        # depending on configuration, but our implementation returns None
        assert result is None

    def test_token_contains_required_claims(self):
        """Test that JWT token contains all required claims."""
        user_id = "test-user-789"
        email = "claims@example.com"
        
        token = create_access_token(
            data={"user_id": user_id, "email": email},
            expires_delta=timedelta(hours=1)
        )
        
        payload = decode_access_token(token)
        
        # Verify all required claims are present
        assert "user_id" in payload
        assert "email" in payload
        assert "exp" in payload, "Token should include 'exp' (expiration)"
        assert "iat" in payload, "Token should include 'iat' (issued at)"
