"""Unit tests for AuthService."""
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import uuid
import hashlib

from src.services.auth_service import AuthService
from src.models.user import User
from src.models.session import Session
from src.core.security import create_access_token, decode_access_token


class TestAuthService:
    """Test suite for AuthService class."""

    def test_create_session_includes_email_in_token(self, db_session, sample_user):
        """Test that create_session includes email in the JWT token payload."""
        auth_service = AuthService(db_session)
        
        # Create session
        access_token, expires_at = auth_service.create_session(sample_user)
        
        # Decode token to verify email is included
        payload = decode_access_token(access_token)
        
        assert payload is not None
        assert "user_id" in payload
        assert "email" in payload, "Token should include email claim"
        assert payload["email"] == sample_user.email
        assert payload["user_id"] == str(sample_user.id)
        assert "exp" in payload
        assert "iat" in payload

    def test_validate_token_returns_email(self, db_session, sample_user):
        """Test that validate_token returns payload with email."""
        auth_service = AuthService(db_session)
        
        # Create session first
        access_token, expires_at = auth_service.create_session(sample_user)
        
        # Validate token
        payload = auth_service.validate_token(access_token)
        
        assert payload is not None
        assert "email" in payload
        assert payload["email"] == sample_user.email
        assert payload["user_id"] == str(sample_user.id)

    def test_revoke_session_success(self, db_session, sample_user):
        """Test successful session revocation (logout)."""
        auth_service = AuthService(db_session)
        
        # Create session
        access_token, expires_at = auth_service.create_session(sample_user)
        token_hash = hashlib.sha256(access_token.encode()).hexdigest()
        
        # Verify session exists
        session = db_session.query(Session).filter(
            Session.token_hash == token_hash
        ).first()
        assert session is not None
        
        # Revoke session
        result = auth_service.revoke_session(access_token)
        
        assert result is True
        
        # Verify session is deleted
        session = db_session.query(Session).filter(
            Session.token_hash == token_hash
        ).first()
        assert session is None

    def test_revoke_session_not_found(self, db_session, sample_user):
        """Test revoking a non-existent session returns False."""
        auth_service = AuthService(db_session)
        
        # Create a fake token that doesn't exist in database
        fake_token = create_access_token(
            data={"user_id": str(uuid.uuid4()), "email": "fake@example.com"},
            expires_delta=timedelta(days=7)
        )
        
        # Try to revoke non-existent session
        result = auth_service.revoke_session(fake_token)
        
        assert result is False

    def test_cleanup_expired_sessions(self, db_session, sample_user):
        """Test cleanup of expired sessions."""
        auth_service = AuthService(db_session)
        
        # Create an expired session manually
        expired_time = datetime.utcnow() - timedelta(days=1)
        token_hash = hashlib.sha256(b"expired_token").hexdigest()
        
        expired_session = Session(
            user_id=sample_user.id,
            token_hash=token_hash,
            expires_at=expired_time
        )
        db_session.add(expired_session)
        db_session.commit()
        
        # Cleanup expired sessions
        deleted_count = auth_service.cleanup_expired_sessions()
        
        assert deleted_count >= 1
        
        # Verify expired session is deleted
        session = db_session.query(Session).filter(
            Session.token_hash == token_hash
        ).first()
        assert session is None
