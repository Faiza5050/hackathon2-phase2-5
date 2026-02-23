"""Authentication service for session and token management."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
import hashlib
import logging

from ..models.session import Session as SessionModel
from ..models.user import User
from ..core.security import create_access_token, decode_access_token
from ..core.config import settings

logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication-related operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, user: User) -> tuple[str, datetime]:
        """
        Create a new session for a user.
        
        Args:
            user: User object
            
        Returns:
            Tuple of (access_token, expires_at)
        """
        # Create JWT token
        expires_delta = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
        access_token = create_access_token(
            data={"user_id": user.id},
            expires_delta=expires_delta
        )
        expires_at = datetime.utcnow() + expires_delta
        
        # Store session hash for potential revocation
        token_hash = hashlib.sha256(access_token.encode()).hexdigest()
        
        session = SessionModel(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        
        self.db.add(session)
        self.db.commit()
        
        logger.info(f"Session created for user: {user.email}")
        return access_token, expires_at
    
    def validate_token(self, token: str) -> dict | None:
        """
        Validate a JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload if valid, None otherwise
        """
        payload = decode_access_token(token)
        if not payload:
            return None
        
        # Check if token is in blacklist (revoked sessions)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        stmt = select(SessionModel).where(
            SessionModel.token_hash == token_hash,
            SessionModel.expires_at > datetime.utcnow()
        )
        session = self.db.execute(stmt).scalar_one_or_none()
        
        if not session:
            logger.warning(f"Invalid or revoked token attempted")
            return None
        
        return payload
    
    def revoke_session(self, token: str) -> bool:
        """
        Revoke a session (logout).
        
        Args:
            token: JWT token string
            
        Returns:
            True if session was revoked, False otherwise
        """
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        stmt = select(SessionModel).where(SessionModel.token_hash == token_hash)
        session = self.db.execute(stmt).scalar_one_or_none()
        
        if session:
            self.db.delete(session)
            self.db.commit()
            logger.info(f"Session revoked for user: {session.user_id}")
            return True
        
        logger.warning(f"Session not found for revocation")
        return False
    
    def cleanup_expired_sessions(self) -> int:
        """
        Delete expired sessions from database.
        
        Returns:
            Number of sessions deleted
        """
        stmt = select(SessionModel).where(SessionModel.expires_at < datetime.utcnow())
        expired_sessions = self.db.execute(stmt).scalars().all()
        
        count = len(expired_sessions)
        for session in expired_sessions:
            self.db.delete(session)
        
        self.db.commit()
        logger.info(f"Cleaned up {count} expired sessions")
        return count
