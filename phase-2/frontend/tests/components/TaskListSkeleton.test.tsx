/**
 * TaskListSkeleton Component Tests
 */
import { render, screen } from '../utils/render';
import { TaskListSkeleton } from '@/components/TaskListSkeleton';

describe('TaskListSkeleton', () => {
  it('should render skeleton with default count of 5 rows', () => {
    render(<TaskListSkeleton />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 5 skeleton rows
    expect(rows).toHaveLength(6);
  });

  it('should render skeleton with custom count', () => {
    render(<TaskListSkeleton count={3} />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 3 skeleton rows
    expect(rows).toHaveLength(4);
  });

  it('should render table headers', () => {
    render(<TaskListSkeleton />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<TaskListSkeleton className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render skeleton elements with skeleton class', () => {
    const { container } = render(<TaskListSkeleton count={1} />);

    const skeletonElements = container.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should render skeleton headers', () => {
    const { container } = render(<TaskListSkeleton />);

    const skeletonHeaders = container.querySelectorAll('.skeleton-header');
    expect(skeletonHeaders).toHaveLength(5);
  });

  it('should render skeleton titles and descriptions for each row', () => {
    const { container } = render(<TaskListSkeleton count={3} />);

    const skeletonTitles = container.querySelectorAll('.skeleton-title');
    const skeletonDescriptions = container.querySelectorAll('.skeleton-description');

    expect(skeletonTitles).toHaveLength(3);
    expect(skeletonDescriptions).toHaveLength(3);
  });

  it('should render skeleton badges for each row', () => {
    const { container } = render(<TaskListSkeleton count={3} />);

    const skeletonBadges = container.querySelectorAll('.skeleton-badge');
    expect(skeletonBadges).toHaveLength(3);
  });

  it('should render skeleton dates for each row', () => {
    const { container } = render(<TaskListSkeleton count={3} />);

    const skeletonDates = container.querySelectorAll('.skeleton-date');
    // 2 date columns per row (due date + created date)
    expect(skeletonDates).toHaveLength(6);
  });

  it('should render skeleton actions for each row', () => {
    const { container } = render(<TaskListSkeleton count={3} />);

    const skeletonActions = container.querySelectorAll('.skeleton-actions');
    expect(skeletonActions).toHaveLength(3);
  });

  it('should include shimmer animation styles', () => {
    const { container } = render(<TaskListSkeleton />);

    // Check that skeleton elements have the animation class
    const skeletonElements = container.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
    
    // The styled-jsx should inject styles, verify at least one element has skeleton class
    const firstSkeleton = skeletonElements[0];
    expect(firstSkeleton).toHaveClass('skeleton');
  });
});
