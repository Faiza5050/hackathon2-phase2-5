"""Integration tests for Tasks API endpoints."""
import pytest
import uuid
from datetime import datetime, timedelta

from src.models.user import User
from src.models.task import Task
from src.api.auth import get_current_user


class TestTaskEndpoints:
    """Test suite for Tasks API endpoints."""

    def _create_auth_headers(self, user_id: str) -> dict:
        """Helper to create mock authentication headers."""
        return {"Authorization": f"Bearer mock_token_{user_id}"}

    def _override_auth(self, client, user_id: str):
        """Helper to override authentication for tests."""
        async def mock_get_current_user():
            return {"user_id": user_id}

        client.app.dependency_overrides[get_current_user] = mock_get_current_user

    def _clear_auth_override(self, client):
        """Clear authentication override."""
        if get_current_user in client.app.dependency_overrides:
            del client.app.dependency_overrides[get_current_user]

    def test_create_task_success(self, client, sample_user, db_session):
        """Test creating a task successfully with authentication."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "New Task",
            "description": "A new task for testing",
            "status": "pending",
            "due_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Task"
        assert data["description"] == "A new task for testing"
        assert data["status"] == "pending"
        assert data["user_id"] == sample_user.id
        assert "id" in data
        assert "created_at" in data

        self._clear_auth_override(client)

    def test_create_task_unauthorized(self, client):
        """Test creating a task without authentication."""
        task_data = {
            "title": "Unauthorized Task",
            "description": "This should fail"
        }

        response = client.post(
            "/api/tasks/",
            json=task_data
        )

        assert response.status_code == 401

    def test_create_task_validation_error(self, client, sample_user, db_session):
        """Test creating a task with invalid data."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "",  # Empty title should fail
            "description": "Invalid task"
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 422

        self._clear_auth_override(client)

    def test_get_tasks_list(self, client, sample_user, db_session):
        """Test getting all tasks for a user."""
        self._override_auth(client, sample_user.id)

        # Create some tasks
        for i in range(3):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                description=f"Description {i}",
                status="pending"
            )
            db_session.add(task)
        db_session.commit()

        response = client.get(
            "/api/tasks/",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        for task in data:
            assert task["user_id"] == sample_user.id

        self._clear_auth_override(client)

    def test_get_tasks_with_status_filter(self, client, sample_user, db_session):
        """Test getting tasks filtered by status."""
        self._override_auth(client, sample_user.id)

        # Create tasks with different statuses
        for status in ["pending", "in_progress", "completed"]:
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {status}",
                status=status
            )
            db_session.add(task)
        db_session.commit()

        response = client.get(
            "/api/tasks/?status=pending",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "pending"

        self._clear_auth_override(client)

    def test_get_tasks_unauthorized(self, client):
        """Test getting tasks without authentication."""
        response = client.get("/api/tasks/")

        assert response.status_code == 401

    def test_get_single_task(self, client, sample_user, sample_task, db_session):
        """Test getting a single task by ID."""
        self._override_auth(client, sample_user.id)

        response = client.get(
            f"/api/tasks/{sample_task.id}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id
        assert data["title"] == "Sample Task"
        assert data["user_id"] == sample_user.id

        self._clear_auth_override(client)

    def test_get_single_task_not_found(self, client, sample_user, db_session):
        """Test getting a task that doesn't exist."""
        self._override_auth(client, sample_user.id)

        response = client.get(
            f"/api/tasks/{str(uuid.uuid4())}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

        self._clear_auth_override(client)

    def test_get_single_task_wrong_user(self, client, sample_user, sample_task, db_session):
        """Test that users can't access other users' tasks."""
        # Create another user
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f",
        )
        db_session.add(other_user)
        db_session.commit()

        self._override_auth(client, other_user.id)

        response = client.get(
            f"/api/tasks/{sample_task.id}",
            headers=self._create_auth_headers(other_user.id)
        )

        assert response.status_code == 404

        self._clear_auth_override(client)

    def test_update_task(self, client, sample_user, sample_task, db_session):
        """Test updating a task."""
        self._override_auth(client, sample_user.id)

        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "status": "completed"
        }

        response = client.put(
            f"/api/tasks/{sample_task.id}",
            json=update_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated description"
        assert data["status"] == "completed"
        assert data["id"] == sample_task.id

        self._clear_auth_override(client)

    def test_update_task_partial(self, client, sample_user, sample_task, db_session):
        """Test updating only specific fields of a task."""
        self._override_auth(client, sample_user.id)
        original_title = sample_task.title

        update_data = {
            "status": "in_progress"
        }

        response = client.put(
            f"/api/tasks/{sample_task.id}",
            json=update_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == original_title  # Unchanged
        assert data["status"] == "in_progress"

        self._clear_auth_override(client)

    def test_update_task_not_found(self, client, sample_user, db_session):
        """Test updating a task that doesn't exist."""
        self._override_auth(client, sample_user.id)

        update_data = {
            "title": "Updated Title"
        }

        response = client.put(
            f"/api/tasks/{str(uuid.uuid4())}",
            json=update_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 404

        self._clear_auth_override(client)

    def test_update_task_wrong_user(self, client, sample_user, sample_task, db_session):
        """Test that users can't update other users' tasks."""
        # Create another user
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f",
        )
        db_session.add(other_user)
        db_session.commit()

        self._override_auth(client, other_user.id)

        update_data = {
            "title": "Hacked Title"
        }

        response = client.put(
            f"/api/tasks/{sample_task.id}",
            json=update_data,
            headers=self._create_auth_headers(other_user.id)
        )

        assert response.status_code == 404

        self._clear_auth_override(client)

    def test_delete_task(self, client, sample_user, sample_task, db_session):
        """Test deleting a task."""
        self._override_auth(client, sample_user.id)
        task_id = sample_task.id  # Store ID before deletion

        response = client.delete(
            f"/api/tasks/{task_id}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "deleted" in data["message"].lower()

        # Verify task is deleted
        get_response = client.get(
            f"/api/tasks/{task_id}",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert get_response.status_code == 404

        self._clear_auth_override(client)

    def test_delete_task_not_found(self, client, sample_user, db_session):
        """Test deleting a task that doesn't exist."""
        self._override_auth(client, sample_user.id)

        response = client.delete(
            f"/api/tasks/{str(uuid.uuid4())}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 404

        self._clear_auth_override(client)

    def test_delete_task_wrong_user(self, client, sample_user, sample_task, db_session):
        """Test that users can't delete other users' tasks."""
        # Create another user
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f",
        )
        db_session.add(other_user)
        db_session.commit()

        self._override_auth(client, other_user.id)

        response = client.delete(
            f"/api/tasks/{sample_task.id}",
            headers=self._create_auth_headers(other_user.id)
        )

        assert response.status_code == 404

        # Verify task still exists for original user
        self._override_auth(client, sample_user.id)
        get_response = client.get(
            f"/api/tasks/{sample_task.id}",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert get_response.status_code == 200

        self._clear_auth_override(client)

    def test_task_ownership_isolation(self, client, sample_user, db_session):
        """Test complete ownership isolation between users."""
        # Create another user
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f",
        )
        db_session.add(other_user)
        db_session.commit()

        # Create tasks for both users
        user_a_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="User A Task",
            status="pending"
        )
        user_b_task = Task(
            id=str(uuid.uuid4()),
            user_id=other_user.id,
            title="User B Task",
            status="pending"
        )
        db_session.add(user_a_task)
        db_session.add(user_b_task)
        db_session.commit()

        # User A can only see their own task
        self._override_auth(client, sample_user.id)
        response_a = client.get(
            "/api/tasks/",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response_a.status_code == 200
        tasks_a = response_a.json()
        assert len(tasks_a) == 1
        assert tasks_a[0]["id"] == user_a_task.id

        # Clear and set auth for User B
        self._clear_auth_override(client)
        self._override_auth(client, other_user.id)
        response_b = client.get(
            "/api/tasks/",
            headers=self._create_auth_headers(other_user.id)
        )
        assert response_b.status_code == 200
        tasks_b = response_b.json()
        assert len(tasks_b) == 1
        assert tasks_b[0]["id"] == user_b_task.id

        # User A cannot access User B's task - reset auth to User A
        self._clear_auth_override(client)
        self._override_auth(client, sample_user.id)
        response = client.get(
            f"/api/tasks/{user_b_task.id}",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 404

        # User B cannot access User A's task - reset auth to User B
        self._clear_auth_override(client)
        self._override_auth(client, other_user.id)
        response = client.get(
            f"/api/tasks/{user_a_task.id}",
            headers=self._create_auth_headers(other_user.id)
        )
        assert response.status_code == 404

        self._clear_auth_override(client)


class TestTaskSearch:
    """Test suite for task search functionality."""

    def _create_auth_headers(self, user_id: str) -> dict:
        """Helper to create mock authentication headers."""
        return {"Authorization": f"Bearer mock_token_{user_id}"}

    def _override_auth(self, client, user_id: str):
        """Helper to override authentication for tests."""
        async def mock_get_current_user():
            return {"user_id": user_id}

        client.app.dependency_overrides[get_current_user] = mock_get_current_user

    def _clear_auth_override(self, client):
        """Clear authentication override."""
        if get_current_user in client.app.dependency_overrides:
            del client.app.dependency_overrides[get_current_user]

    def test_get_tasks_with_search_query(self, client, sample_user, db_session):
        """Test that search query parameter filters tasks."""
        self._override_auth(client, sample_user.id)

        # Create tasks with searchable content
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Buy groceries", description="Shopping list", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Finish project report", description="Q4 financial report", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Call mom", description="Weekly check-in", status="completed"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project meeting", description="Discuss project timeline", status="in_progress"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        # Search by title
        response = client.get(
            "/api/tasks/?search=project",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all("project" in task["title"].lower() for task in data)

        # Search by description
        response = client.get(
            "/api/tasks/?search=shopping",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Buy groceries"

        self._clear_auth_override(client)

    def test_get_tasks_search_unauthorized(self, client):
        """Test that search requires authentication (401 without token)."""
        response = client.get("/api/tasks/?search=test")
        assert response.status_code == 401

    def test_get_tasks_search_combined(self, client, sample_user, db_session):
        """Test search combined with status filter and sorting."""
        self._override_auth(client, sample_user.id)

        now = datetime.utcnow()
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A planning", description="Plan project A", status="pending", created_at=now - timedelta(days=3)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A execution", description="Execute project A", status="in_progress", created_at=now - timedelta(days=2)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A review", description="Review project A", status="completed", created_at=now - timedelta(days=1)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project B planning", description="Plan project B", status="pending", created_at=now - timedelta(hours=5)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Random task", description="Nothing related", status="pending", created_at=now - timedelta(hours=1)),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        # Search + status filter
        response = client.get(
            "/api/tasks/?search=project&status=pending",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(task["status"] == "pending" for task in data)

        # Search + sort by created_at ascending
        response = client.get(
            "/api/tasks/?search=project&sort_by=created_at&order=asc",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4  # All 4 project tasks
        # Verify sorted ascending
        for i in range(len(data) - 1):
            assert data[i]["created_at"] <= data[i + 1]["created_at"]

        # Search + status + sort combined
        response = client.get(
            "/api/tasks/?search=project&status=pending&sort_by=created_at&order=desc",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(task["status"] == "pending" for task in data)
        # Verify sorted descending
        for i in range(len(data) - 1):
            assert data[i]["created_at"] >= data[i + 1]["created_at"]

        self._clear_auth_override(client)

    def test_get_tasks_search_empty_query(self, client, sample_user, db_session):
        """Test that empty search returns all tasks."""
        self._override_auth(client, sample_user.id)

        # Create some tasks
        for i in range(3):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                description=f"Description {i}",
                status="pending"
            )
            db_session.add(task)
        db_session.commit()

        # Empty search should return all tasks
        response = client.get(
            "/api/tasks/?search=",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        # No search param should also return all tasks
        response = client.get(
            "/api/tasks/",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        self._clear_auth_override(client)

    def test_get_tasks_search_special_characters(self, client, sample_user, db_session):
        """Test that search handles special characters safely."""
        self._override_auth(client, sample_user.id)

        # Create tasks with special characters in title/description
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task with 'quotes'", description="Contains single quotes", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title='Task with "double quotes"', description="Contains double quotes", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task with % percent", description="Contains percent sign", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task with _ underscore", description="Contains underscore", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="SQL injection test", description="'; DROP TABLE tasks; --", status="pending"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        # Search with special characters - should not cause SQL injection
        response = client.get(
            "/api/tasks/?search=%25",  # URL encoded %
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        # Should find the task with percent sign
        assert len(data) >= 1

        # Search with quotes - should work safely
        response = client.get(
            "/api/tasks/?search=quotes",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # SQL injection attempt should be treated as plain text
        response = client.get(
            "/api/tasks/?search='; DROP TABLE tasks; --",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        # Should not crash, may or may not find results
        data = response.json()
        assert isinstance(data, list)

        self._clear_auth_override(client)
