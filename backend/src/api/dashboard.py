"""Dashboard API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..api.auth import get_current_user
from ..services.task_service import TaskService
from ..schemas.task import TaskResponse

logger = __import__('logging').getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
async def get_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard data including task statistics and recent tasks.
    
    Requires authentication.
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)
    
    # Get statistics
    stats = task_service.get_task_stats(user_id)
    
    # Get recent tasks
    recent_tasks = task_service.get_recent_tasks(user_id, limit=5)
    
    logger.info(f"Dashboard accessed for user {user_id}")
    
    return {
        "summary": stats,
        "recent_tasks": [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat()
            }
            for task in recent_tasks
        ]
    }
