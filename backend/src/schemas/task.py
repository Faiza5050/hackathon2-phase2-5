"""Task Pydantic schemas for request/response validation."""
from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    """Base task schema with common attributes."""
    title: str
    description: Optional[str] = None
    status: str = "pending"
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title length."""
        if not v or len(v.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(v) > 255:
            raise ValueError("Title must be less than 255 characters")
        return v.strip()
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """Validate status value."""
        allowed_statuses = ["pending", "in_progress", "completed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TaskCreate(TaskBase):
    """Schema for task creation request."""
    pass


class TaskUpdate(BaseModel):
    """Schema for task update request (all fields optional)."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title length if provided."""
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("Title cannot be empty")
            if len(v) > 255:
                raise ValueError("Title must be less than 255 characters")
        return v
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """Validate status value if provided."""
        if v is not None:
            allowed_statuses = ["pending", "in_progress", "completed"]
            if v not in allowed_statuses:
                raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class TaskResponse(TaskBase):
    """Schema for task response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    created_at: datetime
