"""Security utilities for password hashing and JWT tokens."""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with required claims.
    
    Args:
        data: Dictionary containing token claims (should include user_id and email)
        expires_delta: Optional timedelta for token expiration
        
    Returns:
        Encoded JWT token string
        
    The token will include:
        - All claims from data dict
        - exp: Expiration timestamp
        - iat: Issued at timestamp
    """
    to_encode = data.copy()

    # 🔹 Convert UUID to string to make it JSON serializable
    if "user_id" in to_encode:
        to_encode["user_id"] = str(to_encode["user_id"])

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)

    # Add required claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()  # Issued at timestamp
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload dict if valid, None otherwise
        
    The decoded payload will include:
        - user_id: User's unique identifier
        - email: User's email address (if included during creation)
        - exp: Expiration timestamp
        - iat: Issued at timestamp
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
