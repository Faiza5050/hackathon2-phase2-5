"""User service for business logic related to user management."""
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models.user import User
from ..schemas.user import UserCreate
from ..core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)


class UserService:
    """Service for user-related operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user with hashed password.
        
        Args:
            user_data: UserCreate schema with email and password
            
        Returns:
            Created User object
            
        Raises:
            ValueError: If email already exists
        """
        # Check if user already exists
        existing_user = self.get_user_by_email(user_data.email)
        if existing_user:
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
            raise ValueError("Email already registered")
        
        # Create new user with hashed password
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        logger.info(f"User created successfully: {db_user.email}")
        return db_user
    
    def get_user_by_email(self, email: str) -> User | None:
        """
        Get user by email address.
        
        Args:
            email: User email
            
        Returns:
            User object or None if not found
        """
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()
    
    def get_user_by_id(self, user_id: str) -> User | None:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User object or None if not found
        """
        stmt = select(User).where(User.id == user_id)
        return self.db.execute(stmt).scalar_one_or_none()
    
    def authenticate_user(self, email: str, password: str) -> User | None:
        """
        Authenticate user with email and password.
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.get_user_by_email(email)
        if not user:
            logger.warning(f"Login attempt with non-existent email: {email}")
            return None
        
        from ..core.security import verify_password
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Login attempt with invalid password for: {email}")
            return None
        
        logger.info(f"User authenticated successfully: {email}")
        return user
