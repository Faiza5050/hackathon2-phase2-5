"""Contract tests for Dashboard API - validates response schema and format."""
import pytest
from datetime import datetime, timedelta, timezone
import uuid
from fastapi import status

from src.models.task import Task
from src.services.auth_service import AuthService


class TestDashboardResponseSchema:
    """Tests validating the dashboard response schema."""

    def test_dashboard_response_schema(self, client, db_session, sample_user):
        """Test full dashboard response structure."""
        now = datetime.now(timezone.utc)
        
        # Create a task
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
        
        # Validate top-level structure
        assert isinstance(data, dict)
        assert set(data.keys()) == {"summary", "recent_tasks"}
        
        # Validate summary is a dict
        assert isinstance(data["summary"], dict)
        
        # Validate recent_tasks is a list
        assert isinstance(data["recent_tasks"], list)

    def test_stats_schema(self, client, db_session, sample_user):
        """Test statistics object format."""
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        stats = data["summary"]
        
        # Validate required fields exist
        required_fields = [
            "total_tasks",
            "pending_tasks",
            "in_progress_tasks",
            "completed_tasks",
            "overdue_tasks"
        ]
        
        for field in required_fields:
            assert field in stats, f"Missing required field: {field}"
            assert isinstance(stats[field], int), f"Field {field} should be an integer"
            assert stats[field] >= 0, f"Field {field} should be non-negative"
        
        # Validate no extra fields
        assert set(stats.keys()) == set(required_fields)

    def test_recent_task_schema(self, client, db_session, sample_user):
        """Test task array format in recent_tasks."""
        now = datetime.now(timezone.utc)
        
        # Create tasks
        for i in range(3):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                description=f"Description {i}",
                status="pending",
                due_date=now + timedelta(days=i)
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
        
        recent_tasks = data["recent_tasks"]
        assert isinstance(recent_tasks, list)
        assert len(recent_tasks) == 3
        
        # Validate each task has required fields
        for task in recent_tasks:
            assert isinstance(task, dict)
            
            # Required fields
            assert "id" in task
            assert "title" in task
            assert "status" in task
            assert "due_date" in task
            assert "created_at" in task
            
            # Validate types
            assert isinstance(task["id"], str)
            assert isinstance(task["title"], str)
            assert isinstance(task["status"], str)
            
            # due_date can be string or None
            assert task["due_date"] is None or isinstance(task["due_date"], str)
            
            # created_at should be a string (ISO format)
            assert isinstance(task["created_at"], str)
            
            # Validate status is one of the allowed values
            assert task["status"] in ["pending", "in_progress", "completed"]

    def test_timestamp_format(self, client, db_session, sample_user):
        """Test that timestamps are in ISO 8601 format."""
        now = datetime.now(timezone.utc)
        
        task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Test Task",
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
        
        recent_tasks = data["recent_tasks"]
        assert len(recent_tasks) > 0
        
        task_data = recent_tasks[0]
        
        # Validate due_date format (ISO 8601)
        if task_data["due_date"] is not None:
            # Should be parseable as ISO format
            try:
                parsed = datetime.fromisoformat(task_data["due_date"].replace('Z', '+00:00'))
                assert isinstance(parsed, datetime)
            except ValueError:
                pytest.fail(f"due_date is not in ISO 8601 format: {task_data['due_date']}")
        
        # Validate created_at format (ISO 8601)
        try:
            parsed = datetime.fromisoformat(task_data["created_at"].replace('Z', '+00:00'))
            assert isinstance(parsed, datetime)
        except ValueError:
            pytest.fail(f"created_at is not in ISO 8601 format: {task_data['created_at']}")

    def test_empty_dashboard_schema(self, client, db_session, sample_user):
        """Test schema when dashboard is empty."""
        # Create auth token
        auth_service = AuthService(db_session)
        token, _ = auth_service.create_session(sample_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Validate structure even when empty
        assert "summary" in data
        assert "recent_tasks" in data
        assert isinstance(data["recent_tasks"], list)
        assert len(data["recent_tasks"]) == 0
        
        # Validate stats are all zero
        stats = data["summary"]
        assert stats["total_tasks"] == 0
        assert stats["pending_tasks"] == 0
        assert stats["in_progress_tasks"] == 0
        assert stats["completed_tasks"] == 0
        assert stats["overdue_tasks"] == 0

    def test_task_with_null_due_date(self, client, db_session, sample_user):
        """Test task with null due_date is handled correctly."""
        task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Task without due date",
            status="pending",
            due_date=None
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
        
        recent_tasks = data["recent_tasks"]
        assert len(recent_tasks) == 1
        
        task_data = recent_tasks[0]
        assert task_data["due_date"] is None
        assert task_data["title"] == "Task without due date"

    def test_stats_mathematical_consistency(self, client, db_session, sample_user):
        """Test that stats are mathematically consistent."""
        now = datetime.now(timezone.utc)
        
        # Create tasks with various statuses
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="T1", status="pending", due_date=now + timedelta(days=1)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="T2", status="pending", due_date=now + timedelta(days=2)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="T3", status="in_progress", due_date=now + timedelta(days=3)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="T4", status="completed", due_date=now - timedelta(days=1)),
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
        
        stats = data["summary"]
        
        # Total should equal sum of pending + in_progress + completed
        calculated_total = (
            stats["pending_tasks"] +
            stats["in_progress_tasks"] +
            stats["completed_tasks"]
        )
        assert stats["total_tasks"] == calculated_total
        
        # Overdue should be <= total
        assert stats["overdue_tasks"] <= stats["total_tasks"]
