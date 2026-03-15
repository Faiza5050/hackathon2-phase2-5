"""Test configuration and fixtures for the application."""
import sys
import os
import uuid
from datetime import datetime, timedelta
from typing import Generator, AsyncGenerator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from src.main import app
from src.core.database import Base, get_db
from src.models.user import User
from src.models.task import Task
from src.models.session import Session

# Test database URL - using the same Neon DB but with test schema approach
# For isolation, we use transactions that rollback after each test
DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://neondb_owner:npg_vQjlfI74VcoH@ep-still-firefly-ai8l68aq-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
)


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator:
    """
    Create a fresh database session for each test.
    Uses transaction rollback for test isolation.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=connection
    )
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        transaction.rollback()
        session.close()
        connection.close()


@pytest.fixture(scope="function")
def client(db_session) -> Generator:
    """
    Create a test client with database dependency override.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db_session) -> User:
    """Create and return a sample user."""
    user = User(
        id=str(uuid.uuid4()),
        email=f"test_{uuid.uuid4().hex[:8]}@example.com",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_user_data() -> dict:
    """Return sample user data for creation."""
    return {
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "password": "SecurePassword123!",
    }


@pytest.fixture
def sample_task(db_session, sample_user) -> Task:
    """Create and return a sample task for the sample user."""
    task = Task(
        id=str(uuid.uuid4()),
        user_id=sample_user.id,
        title="Sample Task",
        description="This is a sample task for testing",
        status="pending",
        due_date=datetime.utcnow() + timedelta(days=7),
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def sample_task_data() -> dict:
    """Return sample task data for creation."""
    return {
        "title": "New Test Task",
        "description": "A new task created for testing",
        "status": "pending",
    }


@pytest.fixture
def sample_session(db_session, sample_user) -> Session:
    """Create and return a sample session for the sample user."""
    session = Session(
        id=str(uuid.uuid4()),
        user_id=sample_user.id,
        token_hash=f"test_token_hash_{uuid.uuid4().hex}",
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    return session


@pytest.fixture
def sample_session_data(sample_user) -> dict:
    """Return sample session data for creation."""
    return {
        "user_id": sample_user.id,
        "token_hash": f"test_token_hash_{uuid.uuid4().hex}",
        "expires_at": datetime.utcnow() + timedelta(days=7),
    }
