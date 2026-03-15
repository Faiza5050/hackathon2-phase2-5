/**
 * Tasks Page
 * 
 * Main page for managing tasks with full CRUD operations.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import type { Task, TaskCreate, TaskUpdate, TaskStatus } from '@/types/task';
import { TaskList } from '@/components/TaskList';
import { TaskFilter } from '@/components/TaskFilter';
import { TaskModal } from '@/components/TaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { TaskListSkeleton } from '@/components/TaskListSkeleton';
import Link from 'next/link';

type ModalMode = 'view' | 'edit' | 'create';

export default function TasksPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'title' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'danger') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = { sortBy, order: sortOrder };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await taskService.getTasks(params);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      showToast('Failed to load tasks', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, sortBy, sortOrder, searchQuery, showToast]);

  useEffect(() => {
    if (!authLoading) {
      loadTasks();
    }
  }, [authLoading, loadTasks]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Handle filter changes
  const handleStatusChange = (status: TaskStatus | 'all') => {
    setFilterStatus(status);
  };

  const handleSortByChange = (newSortBy: 'created_at' | 'due_date' | 'title' | 'status') => {
    setSortBy(newSortBy);
  };

  const handleOrderChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle task actions
  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTask(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmitTask = async (data: TaskCreate | TaskUpdate) => {
    try {
      if (modalMode === 'create') {
        await taskService.createTask(data as TaskCreate);
        showToast('Task created successfully', 'success');
      } else if (selectedTask) {
        await taskService.updateTask(selectedTask.id, data as TaskUpdate);
        showToast('Task updated successfully', 'success');
      }
      setIsModalOpen(false);
      await loadTasks();
    } catch (err) {
      throw err; // Re-throw to be handled by TaskForm
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete.id);
      showToast('Task deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      await loadTasks();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete task', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Close modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Task Management</span>
          <div className="d-flex align-items-center gap-3">
            <Link href="/dashboard" className="btn btn-outline-light btn-sm">
              Dashboard
            </Link>
            <span className="text-white d-none d-sm-inline">{user?.email}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">My Tasks</h1>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus-lg me-2"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
              />
            </svg>
            New Task
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button
              type="button"
              className="btn btn-link btn-sm float-end"
              onClick={loadTasks}
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <TaskFilter
              status={filterStatus}
              sortBy={sortBy}
              order={sortOrder}
              search={searchQuery}
              onStatusChange={handleStatusChange}
              onSortByChange={handleSortByChange}
              onOrderChange={handleOrderChange}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="card shadow-sm">
          <div className="card-body">
            {isLoading ? (
              <TaskListSkeleton count={5} />
            ) : (
              <TaskList
                tasks={tasks}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteClick}
              />
            )}
          </div>
        </div>

        {/* Task count */}
        {!isLoading && tasks && tasks.length > 0 && (
          <div className="text-muted mt-2">
            Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}

        {/* Empty state for search */}
        {!isLoading && tasks && tasks.length === 0 && searchQuery && (
          <div className="text-center py-5">
            <p className="text-muted mb-2">No tasks found matching "{searchQuery}"</p>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSubmit={handleSubmitTask}
        mode={modalMode === 'create' ? 'edit' : modalMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        taskTitle={taskToDelete?.title}
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`position-fixed bottom-0 end-0 p-3 ${
            toast.type === 'success' ? 'bg-success' : 'bg-danger'
          } text-white`}
          style={{ zIndex: 1050 }}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
