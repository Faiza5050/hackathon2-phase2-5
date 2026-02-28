"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.config import settings
from .api.auth import router as auth_router
from .api.dashboard import router as dashboard_router
from .api.tasks import router as tasks_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    version="0.1.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")

logger.info("FastAPI application initialized")


@app.get("/")
async def root():
    """Root endpoint."""
    logger.info("Root endpoint accessed")
    return {"message": "Phase-2 Features API", "status": "running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "name": settings.PROJECT_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "dashboard": "/api/dashboard",
            "tasks": "/api/tasks",
        }
    }
