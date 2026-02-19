import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Eye } from 'lucide-react';
import IconButton from '../IconButton';

describe('IconButton', () => {
  it('renders as button when onClick is provided', () => {
    const onClick = vi.fn();
    render(
      <IconButton icon={Eye} ariaLabel="View" onClick={onClick} />
    );
    const button = screen.getByRole('button', { name: 'View' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has aria-label for accessibility', () => {
    render(
      <IconButton icon={Eye} ariaLabel="View copies" onClick={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'View copies' })).toBeInTheDocument();
  });

  it('has title attribute for tooltip', () => {
    render(
      <IconButton
        icon={Eye}
        ariaLabel="View"
        title="View copies"
        onClick={vi.fn()}
      />
    );
    const button = screen.getByRole('button', { name: 'View' });
    expect(button).toHaveAttribute('title', 'View copies');
  });

  it('renders as link when href is provided', () => {
    render(
      <IconButton icon={Eye} ariaLabel="Edit" href="/books/1/edit" />
    );
    const link = screen.getByRole('link', { name: 'Edit' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/books/1/edit');
  });
});
