"""Unit tests for Task Pydantic schemas."""
import pytest
from datetime import datetime, timedelta

from src.schemas.task import TaskBase, TaskCreate, TaskUpdate, TaskResponse


class TestTaskCreateSchema:
    """Test suite for TaskCreate schema validation."""

    def test_task_create_valid(self):
        """Test creating a valid TaskCreate schema."""
        task_data = {
            "title": "Test Task",
            "description": "This is a test task",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=7)
        }

        task = TaskCreate(**task_data)

        assert task.title == "Test Task"
        assert task.description == "This is a test task"
        assert task.status == "pending"
        assert task.due_date is not None

    def test_task_create_valid_minimal(self):
        """Test creating a valid TaskCreate with minimal data."""
        task_data = {
            "title": "Test Task"
        }

        task = TaskCreate(**task_data)

        assert task.title == "Test Task"
        assert task.description is None
        assert task.status == "pending"  # default value
        assert task.due_date is None

    def test_task_create_invalid_title_empty(self):
        """Test that empty title raises validation error."""
        task_data = {
            "title": ""
        }

        with pytest.raises(ValueError) as exc_info:
            TaskCreate(**task_data)

        assert "Title cannot be empty" in str(exc_info.value)

    def test_task_create_invalid_title_whitespace(self):
        """Test that whitespace-only title raises validation error."""
        task_data = {
            "title": "   "
        }

        with pytest.raises(ValueError) as exc_info:
            TaskCreate(**task_data)

        assert "Title cannot be empty" in str(exc_info.value)

    def test_task_create_invalid_title_too_long(self):
        """Test that title exceeding 255 characters raises validation error."""
        task_data = {
            "title": "A" * 256
        }

        with pytest.raises(ValueError) as exc_info:
            TaskCreate(**task_data)

        assert "Title must be less than 255 characters" in str(exc_info.value)

    def test_task_create_invalid_status(self):
        """Test that invalid status raises validation error."""
        task_data = {
            "title": "Test Task",
            "status": "invalid_status"
        }

        with pytest.raises(ValueError) as exc_info:
            TaskCreate(**task_data)

        assert "Status must be one of:" in str(exc_info.value)
        assert "pending" in str(exc_info.value)
        assert "in_progress" in str(exc_info.value)
        assert "completed" in str(exc_info.value)

    def test_task_create_valid_statuses(self):
        """Test all valid status values."""
        valid_statuses = ["pending", "in_progress", "completed"]

        for status in valid_statuses:
            task_data = {
                "title": "Test Task",
                "status": status
            }

            task = TaskCreate(**task_data)
            assert task.status == status

    def test_task_create_title_trimming(self):
        """Test that title is trimmed of leading/trailing whitespace."""
        task_data = {
            "title": "  Test Task  "
        }

        task = TaskCreate(**task_data)

        assert task.title == "Test Task"


class TestTaskUpdateSchema:
    """Test suite for TaskUpdate schema validation."""

    def test_task_update_partial_fields(self):
        """Test updating only specific fields."""
        update_data = {
            "title": "Updated Title"
        }

        task_update = TaskUpdate(**update_data)

        assert task_update.title == "Updated Title"
        assert task_update.description is None
        assert task_update.status is None
        assert task_update.due_date is None

    def test_task_update_all_fields(self):
        """Test updating all fields."""
        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "status": "completed",
            "due_date": datetime.utcnow() + timedelta(days=14)
        }

        task_update = TaskUpdate(**update_data)

        assert task_update.title == "Updated Title"
        assert task_update.description == "Updated description"
        assert task_update.status == "completed"
        assert task_update.due_date is not None

    def test_task_update_empty_fields(self):
        """Test that all fields are optional."""
        task_update = TaskUpdate()

        assert task_update.title is None
        assert task_update.description is None
        assert task_update.status is None
        assert task_update.due_date is None

    def test_task_update_invalid_title_empty(self):
        """Test that empty title raises validation error."""
        update_data = {
            "title": ""
        }

        with pytest.raises(ValueError) as exc_info:
            TaskUpdate(**update_data)

        assert "Title cannot be empty" in str(exc_info.value)

    def test_task_update_invalid_title_too_long(self):
        """Test that title exceeding 255 characters raises validation error."""
        update_data = {
            "title": "A" * 256
        }

        with pytest.raises(ValueError) as exc_info:
            TaskUpdate(**update_data)

        assert "Title must be less than 255 characters" in str(exc_info.value)

    def test_task_update_invalid_status(self):
        """Test that invalid status raises validation error."""
        update_data = {
            "status": "invalid_status"
        }

        with pytest.raises(ValueError) as exc_info:
            TaskUpdate(**update_data)

        assert "Status must be one of:" in str(exc_info.value)

    def test_task_update_valid_statuses(self):
        """Test all valid status values in update."""
        valid_statuses = ["pending", "in_progress", "completed"]

        for status in valid_statuses:
            update_data = {
                "status": status
            }

            task_update = TaskUpdate(**update_data)
            assert task_update.status == status


class TestTaskBaseSchema:
    """Test suite for TaskBase schema validation."""

    def test_task_base_valid(self):
        """Test creating a valid TaskBase schema."""
        task_data = {
            "title": "Test Task",
            "description": "Description",
            "status": "pending",
            "due_date": datetime.utcnow()
        }

        task = TaskBase(**task_data)

        assert task.title == "Test Task"
        assert task.description == "Description"
        assert task.status == "pending"

    def test_task_base_invalid_title(self):
        """Test that invalid title raises validation error."""
        task_data = {
            "title": ""
        }

        with pytest.raises(ValueError):
            TaskBase(**task_data)

    def test_task_base_invalid_status(self):
        """Test that invalid status raises validation error."""
        task_data = {
            "title": "Test",
            "status": "unknown"
        }

        with pytest.raises(ValueError):
            TaskBase(**task_data)


class TestTaskResponseSchema:
    """Test suite for TaskResponse schema validation."""

    def test_task_response_from_orm(self):
        """Test creating TaskResponse from ORM object."""
        from unittest.mock import MagicMock

        mock_task = MagicMock()
        mock_task.id = "test-id-123"
        mock_task.user_id = "user-id-456"
        mock_task.title = "Test Task"
        mock_task.description = "Description"
        mock_task.status = "pending"
        mock_task.due_date = datetime.utcnow()
        mock_task.created_at = datetime.utcnow()

        response = TaskResponse.model_validate(mock_task)

        assert response.id == "test-id-123"
        assert response.user_id == "user-id-456"
        assert response.title == "Test Task"
        assert response.description == "Description"
        assert response.status == "pending"

    def test_task_response_has_all_fields(self):
        """Test that TaskResponse includes all required fields."""
        from unittest.mock import MagicMock

        mock_task = MagicMock()
        mock_task.id = "test-id"
        mock_task.user_id = "user-id"
        mock_task.title = "Test"
        mock_task.description = None
        mock_task.status = "pending"
        mock_task.due_date = None
        mock_task.created_at = datetime.utcnow()

        response = TaskResponse.model_validate(mock_task)

        # Verify all fields exist
        assert hasattr(response, 'id')
        assert hasattr(response, 'user_id')
        assert hasattr(response, 'title')
        assert hasattr(response, 'description')
        assert hasattr(response, 'status')
        assert hasattr(response, 'due_date')
        assert hasattr(response, 'created_at')
