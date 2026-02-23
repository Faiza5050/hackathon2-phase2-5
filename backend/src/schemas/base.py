"""Base Pydantic schemas for request/response validation."""
from pydantic import BaseModel


class BaseResponse(BaseModel):
    """Base response schema."""
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
