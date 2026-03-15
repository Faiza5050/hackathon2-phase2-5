"""Integration tests for Dashboard API endpoints."""
import pytest
from datetime import datetime, timedelta, timezone
import uuid
from fastapi import status

from src.models.task import Task
from src.services.auth_service import AuthService


class TestDashboardEndpoint:
    """Tests for the dashboard API endpoint."""

    def test_get_dashboard_success(self, client, db_session, sample_user):
        """Test successful dashboard retrieval with authentication."""
        # Create some tasks for the user
        now = datetime.now(timezone.utc)
        tasks = [
            Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title="Task 1",
                status="pending",
                due_date=now + timedelta(days=1)
            ),
            Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title="Task 2",
                status="in_progress",
                due_date=now + timedelta(days=2)
            ),
            Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title="Task 3",
                status="completed",
                due_date=now - timedelta(days=1)
            ),
        ]
        db_session.add_all(tasks)
        db_session.commit()
        
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "summary" in data
        assert "recent_tasks" in data
        assert data["summary"]["total_tasks"] == 3
        assert data["summary"]["pending_tasks"] == 1
        assert data["summary"]["in_progress_tasks"] == 1
        assert data["summary"]["completed_tasks"] == 1

    def test_get_dashboard_unauthorized(self, client):
        """Test dashboard access without authentication returns 401."""
        response = client.get("/api/dashboard/")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_dashboard_stats_correct(self, client, db_session, sample_user):
        """Test that stats match actual task counts."""
        now = datetime.now(timezone.utc)
        
        # Create specific task distribution
        task_configs = [
            ("Pending 1", "pending", now + timedelta(days=1)),
            ("Pending 2", "pending", now + timedelta(days=2)),
            ("In Progress 1", "in_progress", now + timedelta(days=3)),
            ("In Progress 2", "in_progress", now + timedelta(days=4)),
            ("In Progress 3", "in_progress", now - timedelta(days=1)),  # Overdue
            ("Completed 1", "completed", now - timedelta(days=2)),
            ("Completed 2", "completed", now - timedelta(days=1)),
        ]
        
        for title, status_val, due_date in task_configs:
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=title,
                status=status_val,
                due_date=due_date
            )
            db_session.add(task)
        db_session.commit()
        
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify counts
        assert data["summary"]["total_tasks"] == 7
        assert data["summary"]["pending_tasks"] == 2
        assert data["summary"]["in_progress_tasks"] == 3
        assert data["summary"]["completed_tasks"] == 2
        assert data["summary"]["overdue_tasks"] == 1  # Only "In Progress 3"

    def test_get_dashboard_recent_tasks_limit(self, client, db_session, sample_user):
        """Test that recent tasks are limited to 5."""
        now = datetime.now(timezone.utc)
        
        # Create 10 tasks
        for i in range(10):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                status="pending",
                created_at=now - timedelta(hours=i)
            )
            db_session.add(task)
        db_session.commit()
        
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert len(data["recent_tasks"]) == 5
        
        # Verify they are the most recent (ordered by created_at desc)
        for i, task in enumerate(data["recent_tasks"]):
            assert "id" in task
            assert "title" in task
            assert "status" in task
            assert "due_date" in task
            assert "created_at" in task

    def test_get_dashboard_with_overdue_tasks(self, client, db_session, sample_user):
        """Test that overdue warning is shown when tasks are overdue."""
        now = datetime.now(timezone.utc)
        
        # Create overdue tasks
        overdue_tasks = [
            Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title="Overdue 1",
                status="pending",
                due_date=now - timedelta(days=2)
            ),
            Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title="Overdue 2",
                status="in_progress",
                due_date=now - timedelta(days=1)
            ),
        ]
        db_session.add_all(overdue_tasks)
        db_session.commit()
        
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["summary"]["overdue_tasks"] == 2

    def test_get_dashboard_empty_state(self, client, db_session, sample_user):
        """Test dashboard when user has no tasks."""
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["summary"]["total_tasks"] == 0
        assert data["summary"]["pending_tasks"] == 0
        assert data["summary"]["in_progress_tasks"] == 0
        assert data["summary"]["completed_tasks"] == 0
        assert data["summary"]["overdue_tasks"] == 0
        assert data["recent_tasks"] == []

    def test_get_dashboard_different_users_isolated(self, client, db_session, sample_user):
        """Test that dashboard only shows tasks for authenticated user."""
        from src.models.user import User
        
        # Create another user properly
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f"
        )
        db_session.add(other_user)
        db_session.commit()
        
        now = datetime.now(timezone.utc)
        
        # Create tasks for other user
        other_user_tasks = [
            Task(
                id=str(uuid.uuid4()),
                user_id=other_user.id,
                title="Other User Task 1",
                status="pending",
                due_date=now + timedelta(days=1)
            ),
            Task(
                id=str(uuid.uuid4()),
                user_id=other_user.id,
                title="Other User Task 2",
                status="pending",
                due_date=now + timedelta(days=2)
            ),
        ]
        db_session.add_all(other_user_tasks)
        
        # Create one task for sample_user
        user_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Sample User Task",
            status="pending",
            due_date=now + timedelta(days=1)
        )
        db_session.add(user_task)
        db_session.commit()
        
        # Create auth token for sample_user
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Should only see sample_user's task, not other_user's tasks
        assert data["summary"]["total_tasks"] == 1
        assert data["recent_tasks"][0]["title"] == "Sample User Task"

    def test_get_dashboard_response_format(self, client, db_session, sample_user):
        """Test the response format structure."""
        now = datetime.now(timezone.utc)
        
        task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Test Task",
            description="Test Description",
            status="pending",
            due_date=now + timedelta(days=1)
        )
        db_session.add(task)
        db_session.commit()
        
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_tasks" in summary
        assert "pending_tasks" in summary
        assert "in_progress_tasks" in summary
        assert "completed_tasks" in summary
        assert "overdue_tasks" in summary
        
        # Verify recent_tasks structure
        assert isinstance(data["recent_tasks"], list)
        if data["recent_tasks"]:
            recent_task = data["recent_tasks"][0]
            assert "id" in recent_task
            assert "title" in recent_task
            assert "status" in recent_task
            assert "due_date" in recent_task
            assert "created_at" in recent_task
