/**
 * TaskStatusBadge Component Tests
 */
import { render, screen } from '../utils/render';
import { TaskStatusBadge, getStatusBadgeClass, getStatusLabel } from '@/components/TaskStatusBadge';

describe('TaskStatusBadge', () => {
  describe('getStatusBadgeClass', () => {
    it('should return bg-success for completed status', () => {
      expect(getStatusBadgeClass('completed')).toBe('bg-success');
    });

    it('should return bg-info for in_progress status', () => {
      expect(getStatusBadgeClass('in_progress')).toBe('bg-info');
    });

    it('should return bg-warning for pending status', () => {
      expect(getStatusBadgeClass('pending')).toBe('bg-warning');
    });
  });

  describe('getStatusLabel', () => {
    it('should return "Completed" for completed status', () => {
      expect(getStatusLabel('completed')).toBe('Completed');
    });

    it('should return "In Progress" for in_progress status', () => {
      expect(getStatusLabel('in_progress')).toBe('In Progress');
    });

    it('should return "Pending" for pending status', () => {
      expect(getStatusLabel('pending')).toBe('Pending');
    });
  });

  describe('TaskStatusBadge component', () => {
    it('should render completed status badge correctly', () => {
      render(<TaskStatusBadge status="completed" />);
      const badge = screen.getByText('Completed');
      expect(badge).toHaveClass('bg-success');
    });

    it('should render in_progress status badge correctly', () => {
      render(<TaskStatusBadge status="in_progress" />);
      const badge = screen.getByText('In Progress');
      expect(badge).toHaveClass('bg-info');
    });

    it('should render pending status badge correctly', () => {
      render(<TaskStatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-warning');
    });

    it('should apply custom className when provided', () => {
      render(<TaskStatusBadge status="pending" className="custom-class" />);
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
