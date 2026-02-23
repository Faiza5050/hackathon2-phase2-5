"""API routers initialization."""
from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .tasks import router as tasks_router

__all__ = ["auth_router", "dashboard_router", "tasks_router"]
