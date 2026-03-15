"""Tasks API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from ..core.database import get_db
from ..api.auth import get_current_user
from ..services.task_service import TaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse

logger = __import__('logging').getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    order: str = Query("desc", description="Sort order"),
    search: Optional[str] = Query(None, description="Search in title and description")
):
    """
    Get all tasks for the authenticated user.

    - **status**: Optional filter (pending, in_progress, completed)
    - **sort_by**: Sort field (created_at, due_date, status)
    - **order**: Sort order (asc, desc)
    - **search**: Optional search query (searches title and description, case-insensitive)
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)

    tasks = task_service.get_user_tasks(
        user_id=user_id,
        status=status,
        sort_by=sort_by,
        order=order,
        search=search
    )

    logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task.
    
    - **title**: Task title (required, max 255 chars)
    - **description**: Optional description
    - **status**: Task status (default: pending)
    - **due_date**: Optional due date
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)
    
    task = task_service.create_task(user_id=user_id, task_data=task_data)
    
    logger.info(f"Task created: {task.id} for user {user_id}")
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    
    Returns 404 if task doesn't exist or user doesn't own it.
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)
    
    task = task_service.get_task_by_id(user_id=user_id, task_id=task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing task.
    
    Only provided fields will be updated.
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)
    
    task = task_service.update_task(user_id=user_id, task_id=task_id, task_data=task_data)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    logger.info(f"Task updated: {task_id}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.
    
    Returns 404 if task doesn't exist or user doesn't own it.
    """
    user_id = current_user["user_id"]
    task_service = TaskService(db)
    
    success = task_service.delete_task(user_id=user_id, task_id=task_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {"message": "Task deleted successfully"}
