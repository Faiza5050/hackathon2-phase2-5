"""Contract tests for Tasks API - validates API response schemas and formats."""
import pytest
import uuid
from datetime import datetime, timedelta

from src.models.user import User
from src.models.task import Task
from src.api.auth import get_current_user


class TestTaskAPIContract:
    """Test suite for Tasks API contract validation."""

    def _override_auth(self, client, user_id: str):
        """Helper to override authentication for tests."""
        async def mock_get_current_user():
            return {"user_id": user_id}

        client.app.dependency_overrides[get_current_user] = mock_get_current_user

    def _clear_auth_override(self, client):
        """Clear authentication override."""
        if get_current_user in client.app.dependency_overrides:
            del client.app.dependency_overrides[get_current_user]

    def _create_auth_headers(self, user_id: str) -> dict:
        """Helper to create mock authentication headers."""
        return {"Authorization": f"Bearer mock_token_{user_id}"}

    def test_create_task_response_schema(self, client, sample_user, db_session):
        """Test that create task response matches expected schema."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "Contract Test Task",
            "description": "Testing response schema",
            "status": "pending"
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 201
        data = response.json()

        # Validate required fields exist
        assert "id" in data
        assert "user_id" in data
        assert "title" in data
        assert "description" in data
        assert "status" in data
        assert "created_at" in data

        # Validate field types
        assert isinstance(data["id"], str)
        assert isinstance(data["user_id"], str)
        assert isinstance(data["title"], str)
        assert isinstance(data["status"], str)
        assert isinstance(data["created_at"], str)

        # Validate optional field
        assert data["description"] is None or isinstance(data["description"], str)

        # Validate due_date is nullable
        assert "due_date" in data
        assert data["due_date"] is None or isinstance(data["due_date"], str)

        # Validate status value
        assert data["status"] in ["pending", "in_progress", "completed"]

        # Validate user_id matches authenticated user
        assert data["user_id"] == sample_user.id

        self._clear_auth_override(client)

    def test_get_tasks_response_schema(self, client, sample_user, db_session):
        """Test that get tasks list response matches expected schema."""
        self._override_auth(client, sample_user.id)

        # Create test tasks
        for i in range(2):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                description=f"Description {i}",
                status="pending",
                due_date=datetime.utcnow() + timedelta(days=i + 1)
            )
            db_session.add(task)
        db_session.commit()

        response = client.get(
            "/api/tasks/",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()

        # Validate response is a list
        assert isinstance(data, list)
        assert len(data) == 2

        # Validate each task in the list
        for task in data:
            # Required fields
            assert "id" in task
            assert "user_id" in task
            assert "title" in task
            assert "status" in task
            assert "created_at" in task

            # Optional fields
            assert "description" in task
            assert "due_date" in task

            # Type validation
            assert isinstance(task["id"], str)
            assert isinstance(task["user_id"], str)
            assert isinstance(task["title"], str)
            assert isinstance(task["status"], str)

            # Status validation
            assert task["status"] in ["pending", "in_progress", "completed"]

        self._clear_auth_override(client)

    def test_get_single_task_response_schema(self, client, sample_user, sample_task, db_session):
        """Test that get single task response matches expected schema."""
        self._override_auth(client, sample_user.id)

        response = client.get(
            f"/api/tasks/{sample_task.id}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()

        # Validate all required fields
        required_fields = ["id", "user_id", "title", "status", "created_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        # Validate optional fields exist (may be null)
        optional_fields = ["description", "due_date"]
        for field in optional_fields:
            assert field in data, f"Missing optional field: {field}"

        # Validate types
        assert isinstance(data["id"], str)
        assert isinstance(data["user_id"], str)
        assert isinstance(data["title"], str)
        assert isinstance(data["status"], str)
        assert isinstance(data["created_at"], str)

        # Validate status value
        assert data["status"] in ["pending", "in_progress", "completed"]

        self._clear_auth_override(client)

    def test_error_response_format_not_found(self, client, sample_user, db_session):
        """Test that error responses follow standard format."""
        self._override_auth(client, sample_user.id)

        response = client.get(
            f"/api/tasks/{str(uuid.uuid4())}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 404
        data = response.json()

        # Validate error response format
        assert "detail" in data
        assert isinstance(data["detail"], str)
        assert len(data["detail"]) > 0

        self._clear_auth_override(client)

    def test_error_response_format_validation_error(self, client, sample_user, db_session):
        """Test that validation error responses follow standard format."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "",  # Invalid empty title
            "status": "invalid_status"  # Invalid status
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 422
        data = response.json()

        # FastAPI returns validation errors in 'detail'
        assert "detail" in data
        assert isinstance(data["detail"], list)

        # Each validation error should have specific structure
        for error in data["detail"]:
            assert "loc" in error  # Location of error
            assert "msg" in error  # Error message
            assert "type" in error  # Error type

        self._clear_auth_override(client)

    def test_error_response_format_unauthorized(self, client):
        """Test that unauthorized error responses follow standard format."""
        response = client.get("/api/tasks/")

        assert response.status_code == 401
        data = response.json()

        # Validate error response format
        assert "detail" in data
        assert isinstance(data["detail"], str)

    def test_delete_task_response_schema(self, client, sample_user, sample_task, db_session):
        """Test that delete task response matches expected schema."""
        self._override_auth(client, sample_user.id)
        task_id = sample_task.id  # Store ID before deletion

        response = client.delete(
            f"/api/tasks/{task_id}",
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()

        # Validate response has message field
        assert "message" in data
        assert isinstance(data["message"], str)
        assert len(data["message"]) > 0

        self._clear_auth_override(client)

    def test_update_task_response_schema(self, client, sample_user, sample_task, db_session):
        """Test that update task response matches expected schema."""
        self._override_auth(client, sample_user.id)

        update_data = {
            "title": "Updated Title",
            "status": "completed"
        }

        response = client.put(
            f"/api/tasks/{sample_task.id}",
            json=update_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 200
        data = response.json()

        # Validate all required fields
        required_fields = ["id", "user_id", "title", "status", "created_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        # Validate updated values
        assert data["title"] == "Updated Title"
        assert data["status"] == "completed"
        assert data["id"] == sample_task.id
        assert data["user_id"] == sample_user.id

        self._clear_auth_override(client)

    def test_task_timestamp_format(self, client, sample_user, db_session):
        """Test that timestamps are in valid ISO format."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "Timestamp Test Task"
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 201
        data = response.json()

        # Validate created_at is ISO format datetime string
        created_at = data["created_at"]
        assert isinstance(created_at, str)

        # Try to parse as ISO format
        try:
            datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        except ValueError:
            pytest.fail(f"created_at is not valid ISO format: {created_at}")

        self._clear_auth_override(client)

    def test_task_id_format(self, client, sample_user, db_session):
        """Test that task IDs are valid UUID format."""
        self._override_auth(client, sample_user.id)

        task_data = {
            "title": "ID Format Test Task"
        }

        response = client.post(
            "/api/tasks/",
            json=task_data,
            headers=self._create_auth_headers(sample_user.id)
        )

        assert response.status_code == 201
        data = response.json()

        # Validate ID is UUID format
        task_id = data["id"]
        try:
            uuid.UUID(task_id)
        except ValueError:
            pytest.fail(f"Task ID is not valid UUID format: {task_id}")

        self._clear_auth_override(client)

    def test_pagination_not_implemented(self, client, sample_user, db_session):
        """Test that pagination parameters are handled (even if not implemented)."""
        self._override_auth(client, sample_user.id)

        # These parameters should not cause errors even if not used
        response = client.get(
            "/api/tasks/?skip=0&limit=10",
            headers=self._create_auth_headers(sample_user.id)
        )

        # Should return 200 (may ignore pagination params)
        assert response.status_code in [200, 422]

        self._clear_auth_override(client)

    def test_search_query_parameter_documentation(self, client, sample_user, db_session):
        """Test that search query parameter is properly documented and validated."""
        self._override_auth(client, sample_user.id)

        # Create test tasks
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Search Test Task", description="Test description", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Another Task", description="Another description", status="pending"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        # Search parameter should be accepted
        response = client.get(
            "/api/tasks/?search=test",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # Search with special characters should be handled safely
        response = client.get(
            "/api/tasks/?search=<script>alert('xss')</script>",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # Very long search query should not cause errors
        long_search = "a" * 1000
        response = client.get(
            f"/api/tasks/?search={long_search}",
            headers=self._create_auth_headers(sample_user.id)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        self._clear_auth_override(client)
