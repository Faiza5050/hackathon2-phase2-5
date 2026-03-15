"""Integration tests for Authentication API endpoints."""
import pytest
from datetime import datetime, timedelta
import uuid
import hashlib
import base64
import json

from src.models.user import User
from src.models.session import Session
from src.core.security import get_password_hash, create_access_token, decode_access_token
from src.services.auth_service import AuthService


def _get_token_payload(token: str) -> dict:
    """Helper to decode JWT token payload."""
    token_parts = token.split(".")
    payload_b64 = token_parts[1]
    padded = payload_b64 + "=" * (4 - len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))


class TestAuthEndpoints:
    """Test suite for authentication API endpoints."""

    def test_register_success(self, client, sample_user_data):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["email"] == sample_user_data["email"]
        assert "created_at" in data
        assert "password" not in data  # Password should not be in response

    def test_register_duplicate_email(self, client, sample_user):
        """Test registration with duplicate email returns 400."""
        # Try to register with existing email
        response = client.post("/api/auth/register", json={
            "email": sample_user.email,
            "password": "AnotherPassword123!"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "already registered" in data["detail"].lower() or "email" in data["detail"].lower()

    def test_register_weak_password(self, client, sample_user_data):
        """Test registration with weak password returns 400."""
        # Test various weak passwords - these will return 422 (validation error) not 400
        weak_passwords = [
            "short",  # Too short
            "alllowercase123",  # No uppercase
            "ALLUPPERCASE123",  # No lowercase
            "NoNumbersHere!",  # No numbers
        ]
        
        for weak_password in weak_passwords:
            response = client.post("/api/auth/register", json={
                "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
                "password": weak_password
            })
            
            # Pydantic validation returns 422, not 400
            assert response.status_code in [400, 422]
            data = response.json()
            assert "detail" in data

    def test_login_success_returns_token_with_email(self, client, db_session):
        """Test successful login returns token with email claim."""
        # Create a user with known credentials
        email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash(password)
        )
        db_session.add(user)
        db_session.commit()
        
        # Login
        response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        
        # Decode token and verify email is present
        payload = _get_token_payload(data["access_token"])
        
        assert "email" in payload, "Token should include email claim"
        assert payload["email"] == email
        assert "user_id" in payload
        assert "exp" in payload
        assert "iat" in payload

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials returns 401."""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_logout_success(self, client, db_session, sample_user):
        """Test successful logout."""
        # Create a session using the same db_session
        auth_service = AuthService(db_session)
        access_token, _ = auth_service.create_session(sample_user)
        
        # Logout with valid token
        response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    def test_logout_invalid_token(self, client):
        """Test logout with invalid token returns 400."""
        # Use an invalid token
        invalid_token = "invalid.token.here"
        
        response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        
        # Should return 400 or 401 depending on implementation
        assert response.status_code in [400, 401]

    def test_get_current_user_success(self, client, db_session, sample_user):
        """Test getting current user with valid token."""
        # Create session using the same db_session
        auth_service = AuthService(db_session)
        access_token, _ = auth_service.create_session(sample_user)
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["email"] == sample_user.email
        assert "created_at" in data

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token returns 401."""
        invalid_token = "invalid.token.here"
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        
        assert response.status_code == 401

    def test_get_current_user_expired_token(self, client, db_session, sample_user):
        """Test getting current user with expired token returns 401."""
        # Create an expired token manually
        expired_token = create_access_token(
            data={"user_id": str(sample_user.id), "email": sample_user.email},
            expires_delta=timedelta(hours=-1)  # Expired 1 hour ago
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401

    def test_token_contains_email_claim(self, client, db_session):
        """Test that login token contains email claim."""
        # Create a user
        email = f"email_claim_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash(password)
        )
        db_session.add(user)
        db_session.commit()
        
        # Login
        response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Decode and verify email claim
        payload = _get_token_payload(data["access_token"])
        
        assert "email" in payload
        assert payload["email"] == email
