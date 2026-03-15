"""Contract tests for Authentication API - Schema validation."""
import pytest
import uuid
from datetime import datetime, timedelta
import re
import base64
import json

from src.models.user import User
from src.core.security import get_password_hash, create_access_token, decode_access_token
from src.services.auth_service import AuthService


def _get_token_payload(token: str) -> dict:
    """Helper to decode JWT token payload."""
    token_parts = token.split(".")
    payload_b64 = token_parts[1]
    padded = payload_b64 + "=" * (4 - len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))


class TestAuthContract:
    """Test suite for API contract/schema validation."""

    def test_register_response_schema(self, client, sample_user_data):
        """Test that register response matches expected schema."""
        response = client.post("/api/auth/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Validate schema fields
        assert "id" in data, "Response must include 'id' field"
        assert "email" in data, "Response must include 'email' field"
        assert "created_at" in data, "Response must include 'created_at' field"
        
        # Validate field types
        assert isinstance(data["id"], str), "id must be a string (UUID)"
        assert isinstance(data["email"], str), "email must be a string"
        assert isinstance(data["created_at"], str), "created_at must be a string (ISO format)"
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        assert re.match(email_pattern, data["email"]), "email must be valid format"
        
        # Validate UUID format
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        assert re.match(uuid_pattern, data["id"].lower()), "id must be valid UUID"
        
        # Validate ISO 8601 datetime format
        try:
            datetime.fromisoformat(data["created_at"].replace('Z', '+00:00'))
        except ValueError:
            pytest.fail("created_at must be valid ISO 8601 format")
        
        # Ensure password is NOT in response
        assert "password" not in data, "password must not be in response"
        assert "hashed_password" not in data, "hashed_password must not be in response"

    def test_login_response_schema(self, client, db_session):
        """Test that login response matches expected schema with token format and expires_in."""
        # Create a user
        email = f"contract_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash(password)
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate required fields
        assert "access_token" in data, "Response must include 'access_token' field"
        assert "token_type" in data, "Response must include 'token_type' field"
        assert "expires_in" in data, "Response must include 'expires_in' field"
        
        # Validate field types
        assert isinstance(data["access_token"], str), "access_token must be a string"
        assert isinstance(data["token_type"], str), "token_type must be a string"
        assert isinstance(data["expires_in"], int), "expires_in must be an integer"
        
        # Validate token_type is 'bearer'
        assert data["token_type"] == "bearer", "token_type must be 'bearer'"
        
        # Validate expires_in is positive
        assert data["expires_in"] > 0, "expires_in must be positive"
        
        # Validate JWT token format (three parts separated by dots)
        token_parts = data["access_token"].split(".")
        assert len(token_parts) == 3, "JWT token must have 3 parts (header.payload.signature)"
        
        # Validate each part is base64url encoded
        for part in token_parts:
            try:
                # Add padding if needed
                padded = part + "=" * (4 - len(part) % 4)
                base64.urlsafe_b64decode(padded)
            except Exception:
                pytest.fail(f"JWT token part is not valid base64url: {part}")
        
        # Validate token payload contains required claims
        payload = _get_token_payload(data["access_token"])
        
        assert "user_id" in payload, "Token must include 'user_id' claim"
        assert "email" in payload, "Token must include 'email' claim"
        assert "exp" in payload, "Token must include 'exp' claim"
        assert "iat" in payload, "Token must include 'iat' claim"

    def test_user_response_schema(self, client, db_session, sample_user):
        """Test that user response matches expected schema (id, email, created_at)."""
        # Create session using the same db_session
        auth_service = AuthService(db_session)
        access_token, _ = auth_service.create_session(sample_user)
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate required fields
        assert "id" in data, "Response must include 'id' field"
        assert "email" in data, "Response must include 'email' field"
        assert "created_at" in data, "Response must include 'created_at' field"
        
        # Validate field types
        assert isinstance(data["id"], str), "id must be a string (UUID)"
        assert isinstance(data["email"], str), "email must be a string"
        assert isinstance(data["created_at"], str), "created_at must be a string"
        
        # Validate email matches
        assert data["email"] == sample_user.email, "email must match user's email"
        
        # Validate UUID format
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        assert re.match(uuid_pattern, data["id"].lower()), "id must be valid UUID"
        
        # Ensure sensitive fields are NOT in response
        assert "password" not in data
        assert "hashed_password" not in data

    def test_error_response_format(self, client):
        """Test that error responses have 'detail' field."""
        # Test 401 error (invalid credentials)
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data, "Error response must include 'detail' field"
        assert isinstance(data["detail"], str), "'detail' must be a string"
        assert len(data["detail"]) > 0, "'detail' must not be empty"
        
        # Test 422 error (weak password - validation error)
        response = client.post("/api/auth/register", json={
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": "weak"
        })
        
        assert response.status_code in [400, 422]
        data = response.json()
        assert "detail" in data, "Error response must include 'detail' field"
        assert isinstance(data["detail"], (str, list)), "'detail' must be a string or list"

    def test_jwt_token_format(self, client, db_session):
        """Test JWT token format and structure."""
        # Create a user
        email = f"jwt_test_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=get_password_hash(password)
        )
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        # Split token into parts
        parts = token.split(".")
        assert len(parts) == 3, "JWT must have 3 parts"
        
        header_b64, payload_b64, signature_b64 = parts
        
        # Decode header
        header_padded = header_b64 + "=" * (4 - len(header_b64) % 4)
        header = json.loads(base64.urlsafe_b64decode(header_padded))
        
        # Validate header
        assert "alg" in header, "JWT header must include 'alg' (algorithm)"
        assert header["alg"] in ["HS256", "HS384", "HS512"], "Algorithm must be secure (HS256+)"
        assert header["alg"] != "none", "Algorithm must not be 'none'"
        assert "typ" in header, "JWT header must include 'typ' (type)"
        assert header["typ"] == "JWT", "Token type must be 'JWT'"
        
        # Decode payload
        payload = _get_token_payload(token)
        
        # Validate payload claims
        assert "user_id" in payload, "Payload must include 'user_id'"
        assert "email" in payload, "Payload must include 'email'"
        assert "exp" in payload, "Payload must include 'exp' (expiration)"
        assert "iat" in payload, "Payload must include 'iat' (issued at)"
        
        # Validate exp > iat
        assert payload["exp"] > payload["iat"], "exp must be greater than iat"
        
        # Validate email matches
        assert payload["email"] == email, "Email in token must match user's email"
        
        # Validate signature is not empty
        assert len(signature_b64) > 0, "JWT signature must not be empty"
