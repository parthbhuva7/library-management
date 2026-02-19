import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaginationControls, {
  DEFAULT_PAGE_SIZE,
} from '../PaginationControls';

describe('PaginationControls', () => {
  it('exports DEFAULT_PAGE_SIZE as 5', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(5);
  });

  it('shows correct range and total', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        limit={20}
        totalCount={45}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getByText(/Showing 1-20 of 45/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it('disables Previous on first page', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        limit={20}
        totalCount={45}
        onPageChange={onPageChange}
      />
    );
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables Next on last page', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={3}
        limit={20}
        totalCount={45}
        onPageChange={onPageChange}
      />
    );
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange with page-1 when Previous is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={2}
        limit={20}
        totalCount={45}
        onPageChange={onPageChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(1, 20);
  });

  it('calls onPageChange with page+1 when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        limit={20}
        totalCount={45}
        onPageChange={onPageChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2, 20);
  });

  it('shows single page when totalCount is less than limit', () => {
    render(
      <PaginationControls
        page={1}
        limit={20}
        totalCount={5}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Showing 1-5 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });

  it('handles empty list', () => {
    render(
      <PaginationControls
        page={1}
        limit={20}
        totalCount={0}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Showing 0-0 of 0/)).toBeInTheDocument();
  });

  it('shows page size selector when onPageSizeChange is provided', () => {
    const onPageSizeChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        limit={10}
        totalCount={50}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />
    );
    const select = screen.getByLabelText('Rows per page');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('10');
  });

  it('calls onPageSizeChange when page size is changed', () => {
    const onPageSizeChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        limit={10}
        totalCount={50}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />
    );
    const select = screen.getByLabelText('Rows per page');
    fireEvent.change(select, { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
