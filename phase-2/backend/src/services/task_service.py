"""Task service for business logic related to task management."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
from typing import Optional, List
import logging

from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate

logger = logging.getLogger(__name__)


class TaskService:
    """Service for task-related operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """
        Create a new task for a user.
        
        Args:
            user_id: Owner user ID
            task_data: TaskCreate schema
            
        Returns:
            Created Task object
        """
        db_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            due_date=task_data.due_date
        )
        
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        
        logger.info(f"Task created: {db_task.id} for user {user_id}")
        return db_task
    
    def get_user_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc",
        search: Optional[str] = None
    ) -> List[Task]:
        """
        Get all tasks for a user with optional filtering, sorting, and search.

        Args:
            user_id: User ID
            status: Optional status filter
            sort_by: Sort field (created_at, due_date, status)
            order: Sort order (asc, desc)
            search: Optional search query (searches title and description)

        Returns:
            List of Task objects
        """
        stmt = select(Task).where(Task.user_id == user_id)

        # Apply search filter (case-insensitive search in title and description)
        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                (Task.title.ilike(search_pattern)) | (Task.description.ilike(search_pattern))
            )

        # Apply status filter
        if status:
            stmt = stmt.where(Task.status == status)

        # Apply sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if order == "desc":
            stmt = stmt.order_by(sort_column.desc())
        else:
            stmt = stmt.order_by(sort_column.asc())

        tasks = self.db.execute(stmt).scalars().all()
        logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")
        return tasks
    
    def get_task_by_id(self, user_id: str, task_id: str) -> Optional[Task]:
        """
        Get a specific task by ID (ensures user ownership).
        
        Args:
            user_id: User ID (for ownership check)
            task_id: Task ID
            
        Returns:
            Task object or None
        """
        stmt = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        task = self.db.execute(stmt).scalar_one_or_none()
        
        if not task:
            logger.warning(f"Task {task_id} not found for user {user_id}")
        return task
    
    def update_task(self, user_id: str, task_id: str, task_data: TaskUpdate) -> Optional[Task]:
        """
        Update a task.
        
        Args:
            user_id: User ID (for ownership check)
            task_id: Task ID
            task_data: TaskUpdate schema
            
        Returns:
            Updated Task object or None
        """
        task = self.get_task_by_id(user_id, task_id)
        if not task:
            return None
        
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(task, field, value)
        
        self.db.commit()
        self.db.refresh(task)
        
        logger.info(f"Task updated: {task_id}")
        return task
    
    def delete_task(self, user_id: str, task_id: str) -> bool:
        """
        Delete a task.
        
        Args:
            user_id: User ID (for ownership check)
            task_id: Task ID
            
        Returns:
            True if deleted, False if not found
        """
        task = self.get_task_by_id(user_id, task_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        
        logger.info(f"Task deleted: {task_id}")
        return True
    
    def get_task_stats(self, user_id: str) -> dict:
        """
        Get task statistics for dashboard.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with task statistics
        """
        # Get all user tasks
        stmt = select(Task).where(Task.user_id == user_id)
        tasks = self.db.execute(stmt).scalars().all()
        
        total = len(tasks)
        pending = sum(1 for t in tasks if t.status == "pending")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        completed = sum(1 for t in tasks if t.status == "completed")
        
        # Count overdue tasks (due date in past and not completed)
        now = datetime.now(timezone.utc)
        overdue = sum(
            1 for t in tasks
            if t.due_date and t.due_date.replace(tzinfo=None) < now.replace(tzinfo=None) and t.status != "completed"
        )
        
        return {
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "overdue_tasks": overdue
        }
    
    def get_recent_tasks(self, user_id: str, limit: int = 5) -> List[Task]:
        """
        Get most recent tasks for dashboard.
        
        Args:
            user_id: User ID
            limit: Number of tasks to return
            
        Returns:
            List of recent Task objects
        """
        stmt = (
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(Task.created_at.desc())
            .limit(limit)
        )
        return self.db.execute(stmt).scalars().all()
