/**
 * Tests for DashboardSkeleton component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

describe('DashboardSkeleton', () => {
  it('test_render_skeleton - Shows skeleton elements', () => {
    render(<DashboardSkeleton />);

    // Check that the skeleton container is rendered
    const skeleton = screen.getByTestId('dashboard-skeleton');
    expect(skeleton).toBeInTheDocument();

    // Check for stats cards skeleton (4 cards) + recent tasks card (1 card) = 5 total
    const cards = skeleton.querySelectorAll('.card');
    expect(cards).toHaveLength(5);

    // Check for table skeleton
    const table = skeleton.querySelector('table');
    expect(table).toBeInTheDocument();

    // Check for table rows skeleton (5 rows)
    const rows = skeleton.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(5);
  });

  it('test_skeleton_animation - Has shimmer animation', () => {
    const { container } = render(<DashboardSkeleton />);

    // Check for skeleton text elements with animation class
    const skeletonTexts = container.querySelectorAll('.skeleton-text');
    expect(skeletonTexts.length).toBeGreaterThan(0);

    // Verify the shimmer style is present (checking for animation property)
    const firstSkeleton = skeletonTexts[0];
    expect(firstSkeleton).toHaveStyle('animation: shimmer 1.5s infinite');
  });

  it('test_skeleton_dimensions - Correct layout', () => {
    const { container } = render(<DashboardSkeleton />);

    // Check for proper Bootstrap grid layout
    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass('g-3');
    expect(row).toHaveClass('mb-4');

    // Check for column layout
    const cols = container.querySelectorAll('.col-md-3');
    expect(cols).toHaveLength(4);

    // Check for card structure
    const cards = container.querySelectorAll('.card');
    cards.forEach((card) => {
      expect(card).toHaveClass('shadow-sm');
      expect(card.querySelector('.card-body')).toBeInTheDocument();
    });

    // Check for table structure
    const table = container.querySelector('table');
    expect(table).toHaveClass('table');
    expect(table).toHaveClass('table-hover');

    // Check for table header
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();

    // Check for table body
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });
});
