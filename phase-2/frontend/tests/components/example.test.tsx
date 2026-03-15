/**
 * Example Component Test
 * 
 * This test demonstrates how to test React components using
 * Testing Library with our custom render utility.
 */

import { render, screen } from '../utils/render';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState Component', () => {
  const defaultProps = {
    title: 'No Items',
    message: 'You don\'t have any items yet.',
  };

  it('renders title and message correctly', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('You don\'t have any items yet.')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and actionHref are provided', () => {
    render(
      <EmptyState
        {...defaultProps}
        actionLabel="Add Item"
        actionHref="/add"
      />
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add Item' })).toHaveAttribute('href', '/add');
  });

  it('does not render action button when actionLabel is not provided', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const customIcon = <svg data-testid="custom-icon" />;
    
    render(<EmptyState {...defaultProps} icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders default inbox icon when no icon is provided', () => {
    render(<EmptyState {...defaultProps} />);

    // SVG icon is present in the document (using className selector since SVG has no accessible role)
    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(document.querySelector('.bi.bi-inbox')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<EmptyState {...defaultProps} />);

    expect(container.firstChild).toHaveClass('text-center');
    expect(container.firstChild).toHaveClass('py-5');
  });
});
