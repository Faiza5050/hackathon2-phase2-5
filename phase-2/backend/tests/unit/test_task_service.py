"""Unit tests for TaskService."""
import pytest
from datetime import datetime, timedelta, timezone
import uuid

from src.services.task_service import TaskService
from src.models.task import Task
from src.schemas.task import TaskCreate


class TestGetTaskStats:
    """Tests for get_task_stats method."""

    def test_get_task_stats_with_overdue_tasks(self, db_session, sample_user):
        """Verify overdue calculation works correctly."""
        # Create tasks with various statuses and due dates
        now = datetime.now(timezone.utc)
        
        # Overdue task (past due date, not completed)
        overdue_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Overdue Task",
            status="pending",
            due_date=now - timedelta(days=2)
        )
        
        # Another overdue task (in_progress but past due)
        overdue_in_progress = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Overdue In Progress",
            status="in_progress",
            due_date=now - timedelta(days=1)
        )
        
        # Not overdue (future due date)
        future_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Future Task",
            status="pending",
            due_date=now + timedelta(days=5)
        )
        
        # Completed task (past due but completed - should NOT count as overdue)
        completed_overdue = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Completed Overdue",
            status="completed",
            due_date=now - timedelta(days=3)
        )
        
        db_session.add_all([overdue_task, overdue_in_progress, future_task, completed_overdue])
        db_session.commit()
        
        task_service = TaskService(db_session)
        stats = task_service.get_task_stats(sample_user.id)
        
        assert stats["total_tasks"] == 4
        assert stats["pending_tasks"] == 2
        assert stats["in_progress_tasks"] == 1
        assert stats["completed_tasks"] == 1
        assert stats["overdue_tasks"] == 2  # Only overdue_task and overdue_in_progress

    def test_get_task_stats_edge_cases(self, db_session, sample_user):
        """Test edge cases: zero tasks, all completed, etc."""
        task_service = TaskService(db_session)
        
        # Test with zero tasks
        stats = task_service.get_task_stats(sample_user.id)
        assert stats["total_tasks"] == 0
        assert stats["pending_tasks"] == 0
        assert stats["in_progress_tasks"] == 0
        assert stats["completed_tasks"] == 0
        assert stats["overdue_tasks"] == 0
        
        # Test with all completed tasks
        for i in range(3):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Completed Task {i}",
                status="completed",
                due_date=datetime.now(timezone.utc) - timedelta(days=i)
            )
            db_session.add(task)
        db_session.commit()
        
        stats = task_service.get_task_stats(sample_user.id)
        assert stats["total_tasks"] == 3
        assert stats["pending_tasks"] == 0
        assert stats["in_progress_tasks"] == 0
        assert stats["completed_tasks"] == 3
        assert stats["overdue_tasks"] == 0  # Completed tasks don't count as overdue
        
        # Test with tasks without due dates (should not be overdue)
        for i in range(2):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"No Due Date Task {i}",
                status="pending",
                due_date=None
            )
            db_session.add(task)
        db_session.commit()
        
        stats = task_service.get_task_stats(sample_user.id)
        assert stats["total_tasks"] == 5
        assert stats["pending_tasks"] == 2
        assert stats["overdue_tasks"] == 0  # No due date = not overdue

    def test_get_task_stats_mixed_statuses(self, db_session, sample_user):
        """Test stats with mixed task statuses."""
        now = datetime.now(timezone.utc)
        
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Pending 1", status="pending", due_date=now + timedelta(days=1)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Pending 2", status="pending", due_date=now + timedelta(days=2)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="In Progress 1", status="in_progress", due_date=now + timedelta(days=3)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="In Progress 2", status="in_progress", due_date=now - timedelta(days=1)),  # Overdue
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Completed 1", status="completed", due_date=now - timedelta(days=2)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Completed 2", status="completed", due_date=now - timedelta(days=1)),
        ]
        
        db_session.add_all(tasks)
        db_session.commit()
        
        task_service = TaskService(db_session)
        stats = task_service.get_task_stats(sample_user.id)
        
        assert stats["total_tasks"] == 6
        assert stats["pending_tasks"] == 2
        assert stats["in_progress_tasks"] == 2
        assert stats["completed_tasks"] == 2
        assert stats["overdue_tasks"] == 1  # Only In Progress 2


class TestGetRecentTasks:
    """Tests for get_recent_tasks method."""

    def test_get_recent_tasks_with_limit(self, db_session, sample_user):
        """Verify limit parameter works correctly."""
        now = datetime.now(timezone.utc)
        
        # Create 10 tasks with different creation times
        tasks = []
        for i in range(10):
            task = Task(
                id=str(uuid.uuid4()),
                user_id=sample_user.id,
                title=f"Task {i}",
                status="pending",
                due_date=now + timedelta(days=i),
                created_at=now - timedelta(hours=i)
            )
            tasks.append(task)
            db_session.add(task)
        db_session.commit()
        
        task_service = TaskService(db_session)
        
        # Test with default limit (5)
        recent = task_service.get_recent_tasks(sample_user.id)
        assert len(recent) == 5
        
        # Verify they are the most recent (created_at in desc order)
        for i in range(len(recent) - 1):
            assert recent[i].created_at >= recent[i + 1].created_at
        
        # Test with custom limit
        recent = task_service.get_recent_tasks(sample_user.id, limit=3)
        assert len(recent) == 3
        
        recent = task_service.get_recent_tasks(sample_user.id, limit=10)
        assert len(recent) == 10

    def test_get_recent_tasks_empty(self, db_session, sample_user):
        """Test when user has no tasks."""
        task_service = TaskService(db_session)
        recent = task_service.get_recent_tasks(sample_user.id)
        
        assert recent == []
        assert len(recent) == 0

    def test_get_recent_tasks_ordering(self, db_session, sample_user):
        """Verify tasks are ordered by created_at descending."""
        now = datetime.now(timezone.utc)
        
        # Create tasks in reverse order
        task1 = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Oldest",
            status="pending",
            created_at=now - timedelta(hours=3)
        )
        task2 = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Middle",
            status="pending",
            created_at=now - timedelta(hours=2)
        )
        task3 = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Newest",
            status="pending",
            created_at=now - timedelta(hours=1)
        )
        
        db_session.add_all([task1, task2, task3])
        db_session.commit()
        
        task_service = TaskService(db_session)
        recent = task_service.get_recent_tasks(sample_user.id, limit=5)
        
        assert len(recent) == 3
        assert recent[0].title == "Newest"
        assert recent[1].title == "Middle"
        assert recent[2].title == "Oldest"

    def test_get_recent_tasks_with_different_users(self, db_session, sample_user):
        """Verify only returns tasks for the specified user."""
        from src.models.user import User
        
        # Create another user properly
        other_user = User(
            id=str(uuid.uuid4()),
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2f2f2f2f2f2f"
        )
        db_session.add(other_user)
        db_session.commit()
        
        # Create task for other user
        other_task = Task(
            id=str(uuid.uuid4()),
            user_id=other_user.id,
            title="Other User Task",
            status="pending"
        )
        
        # Create task for sample_user
        user_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Sample User Task",
            status="pending"
        )
        
        db_session.add_all([other_task, user_task])
        db_session.commit()
        
        task_service = TaskService(db_session)
        recent = task_service.get_recent_tasks(sample_user.id)
        
        assert len(recent) == 1
        assert recent[0].title == "Sample User Task"


class TestOverdueCalculation:
    """Specific tests for overdue task calculation logic."""

    def test_overdue_with_timezone_aware_datetime(self, db_session, sample_user):
        """Verify overdue calculation works with timezone-aware datetimes."""
        # Use timezone-aware datetime
        now = datetime.now(timezone.utc)
        past = now - timedelta(days=1)
        future = now + timedelta(days=1)
        
        # Overdue task with timezone-aware due_date
        overdue = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Overdue",
            status="pending",
            due_date=past
        )
        
        # Not overdue
        not_overdue = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Not Overdue",
            status="pending",
            due_date=future
        )
        
        db_session.add_all([overdue, not_overdue])
        db_session.commit()
        
        task_service = TaskService(db_session)
        stats = task_service.get_task_stats(sample_user.id)
        
        assert stats["overdue_tasks"] == 1

    def test_overdue_edge_case_exactly_now(self, db_session, sample_user):
        """Test task due exactly now is not overdue."""
        now = datetime.now(timezone.utc)

        # Task due slightly in the future (to account for timing)
        # This should NOT be overdue
        future_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Future Task",
            status="pending",
            due_date=now + timedelta(seconds=10)
        )

        db_session.add(future_task)
        db_session.commit()

        task_service = TaskService(db_session)
        stats = task_service.get_task_stats(sample_user.id)

        # Due in the future should not be overdue
        assert stats["overdue_tasks"] == 0

        # Now test a task that is definitely in the past
        past_task = Task(
            id=str(uuid.uuid4()),
            user_id=sample_user.id,
            title="Past Task",
            status="pending",
            due_date=now - timedelta(seconds=10)
        )

        db_session.add(past_task)
        db_session.commit()

        stats = task_service.get_task_stats(sample_user.id)

        # Past task should be overdue
        assert stats["overdue_tasks"] == 1


class TestGetUserTasksWithSearch:
    """Tests for get_user_tasks method with search functionality."""

    def test_get_user_tasks_with_search_title(self, db_session, sample_user):
        """Test searching tasks by title substring."""
        # Create tasks with different titles
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Buy groceries", description="Shopping list", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Finish project report", description="Q4 report", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Call mom", description="Weekly call", status="completed"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project meeting", description="Discuss project timeline", status="in_progress"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        task_service = TaskService(db_session)

        # Search for "project" - should match 2 tasks
        result = task_service.get_user_tasks(sample_user.id, search="project")
        assert len(result) == 2
        assert all("project" in task.title.lower() for task in result)

        # Search for "groceries" - should match 1 task
        result = task_service.get_user_tasks(sample_user.id, search="groceries")
        assert len(result) == 1
        assert result[0].title == "Buy groceries"

    def test_get_user_tasks_with_search_description(self, db_session, sample_user):
        """Test searching tasks by description."""
        # Create tasks with searchable descriptions
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task 1", description="Important meeting with team", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task 2", description="Buy milk and eggs", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Task 3", description="Team building event", status="completed"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        task_service = TaskService(db_session)

        # Search for "team" - should match 2 tasks (in description)
        result = task_service.get_user_tasks(sample_user.id, search="team")
        assert len(result) == 2

        # Search for "milk" - should match 1 task
        result = task_service.get_user_tasks(sample_user.id, search="milk")
        assert len(result) == 1
        assert result[0].description == "Buy milk and eggs"

    def test_get_user_tasks_with_search_no_results(self, db_session, sample_user):
        """Test search with no matching results."""
        # Create some tasks
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Buy groceries", description="Shopping", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Finish report", description="Work", status="pending"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        task_service = TaskService(db_session)

        # Search for something that doesn't exist
        result = task_service.get_user_tasks(sample_user.id, search="nonexistent_xyz123")
        assert len(result) == 0

    def test_get_user_tasks_search_case_insensitive(self, db_session, sample_user):
        """Test that search is case insensitive."""
        # Create tasks with mixed case
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="IMPORTANT Meeting", description="URGENT task", status="pending"),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="casual walk", description="relaxing activity", status="pending"),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        task_service = TaskService(db_session)

        # Search with different cases - should all match
        result_upper = task_service.get_user_tasks(sample_user.id, search="IMPORTANT")
        assert len(result_upper) == 1

        result_lower = task_service.get_user_tasks(sample_user.id, search="important")
        assert len(result_lower) == 1

        result_mixed = task_service.get_user_tasks(sample_user.id, search="UrGent")
        assert len(result_mixed) == 1

    def test_get_user_tasks_search_combined_filters(self, db_session, sample_user):
        """Test search combined with status filter and sorting."""
        now = datetime.now(timezone.utc)

        # Create tasks with various statuses and titles
        tasks = [
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A planning", description="Plan project A", status="pending", created_at=now - timedelta(days=3)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A execution", description="Execute project A", status="in_progress", created_at=now - timedelta(days=2)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project A review", description="Review project A", status="completed", created_at=now - timedelta(days=1)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Project B planning", description="Plan project B", status="pending", created_at=now - timedelta(hours=5)),
            Task(id=str(uuid.uuid4()), user_id=sample_user.id, title="Random task", description="Nothing related", status="pending", created_at=now - timedelta(hours=1)),
        ]
        db_session.add_all(tasks)
        db_session.commit()

        task_service = TaskService(db_session)

        # Search "project" with status "pending" - should match 2 tasks
        result = task_service.get_user_tasks(sample_user.id, search="project", status="pending")
        assert len(result) == 2
        assert all("project" in task.title.lower() for task in result)
        assert all(task.status == "pending" for task in result)

        # Search "project" with status "completed" - should match 1 task
        result = task_service.get_user_tasks(sample_user.id, search="project", status="completed")
        assert len(result) == 1
        assert result[0].title == "Project A review"

        # Search "project" (all statuses) - should match 4 tasks
        result = task_service.get_user_tasks(
            sample_user.id, search="project", sort_by="created_at", order="asc"
        )
        assert len(result) == 4
        # Verify sorted by created_at ascending
        for i in range(len(result) - 1):
            assert result[i].created_at <= result[i + 1].created_at

        # Search "project" sorted by created_at descending
        result = task_service.get_user_tasks(
            sample_user.id, search="project", sort_by="created_at", order="desc"
        )
        assert len(result) == 4
        # Verify sorted by created_at descending
        for i in range(len(result) - 1):
            assert result[i].created_at >= result[i + 1].created_at
