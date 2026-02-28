"""API routers initialization."""
from src.api.auth import router as auth_router
from src.api.dashboard import router as dashboard_router
from src.api.tasks import router as tasks_router

__all__ = ["auth_router", "dashboard_router", "tasks_router"]
