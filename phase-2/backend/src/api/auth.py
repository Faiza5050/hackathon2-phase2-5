"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

from ..core.database import get_db
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..services.user_service import UserService
from ..services.auth_service import AuthService
from ..core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

# Initialize limiter for this module
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")  # Limit registration to prevent spam
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.

    - **email**: Valid email address (must be unique)
    - **password**: Password (min 8 chars, uppercase, lowercase, number required)
    
    Rate limit: 5 requests per minute
    """
    user_service = UserService(db)
    try:
        user = user_service.create_user(user_data)
        logger.info(f"New user registered: {user.email}")
        return user
    except ValueError as e:
        logger.warning(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")  # Limit login attempts to prevent brute force
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.

    - **email**: User email
    - **password**: User password

    Returns access token valid for 7 days.
    
    Rate limit: 10 requests per minute
    """
    user_service = UserService(db)
    auth_service = AuthService(db)

    # Authenticate user
    user = user_service.authenticate_user(credentials.email, credentials.password)
    if not user:
        logger.warning(f"Login failed for: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create session and token
    access_token, expires_at = auth_service.create_session(user)
    expires_in = int((expires_at - __import__('datetime').datetime.utcnow()).total_seconds())

    logger.info(f"User logged in: {user.email}")
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in
    )


@router.post("/logout")
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Logout user and invalidate session.

    Requires valid Bearer token in Authorization header.
    """
    auth_service = AuthService(db)

    success = auth_service.revoke_session(credentials.credentials)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already revoked token"
        )

    logger.info("User logged out successfully")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.

    Requires valid Bearer token in Authorization header.
    Returns user details including id, email, and created_at.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(db)
    payload = auth_service.validate_token(credentials.credentials)

    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_service = UserService(db)
    user = user_service.get_user_by_id(payload["user_id"])

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """
    Dependency to get current authenticated user from token.

    Returns user_id from validated token.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(db)
    payload = auth_service.validate_token(credentials.credentials)

    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"user_id": payload["user_id"]}
