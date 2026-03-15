"""Task model for task management."""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from src.core.database import Base


class Task(Base):
    """Task model representing a user task."""
    
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'in_progress', 'completed')", name="check_status"),
    )
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"
