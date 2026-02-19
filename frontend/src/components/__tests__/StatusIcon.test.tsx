import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusIcon from '../StatusIcon';

describe('StatusIcon', () => {
  it('renders icon for active status', () => {
    render(<StatusIcon status="active" />);
    expect(screen.getByRole('img', { name: 'Active' })).toBeInTheDocument();
  });

  it('renders icon for returned status', () => {
    render(<StatusIcon status="returned" />);
    expect(screen.getByRole('img', { name: 'Returned' })).toBeInTheDocument();
  });

  it('renders icon for available status', () => {
    render(<StatusIcon status="available" />);
    expect(screen.getByRole('img', { name: 'Available' })).toBeInTheDocument();
  });

  it('renders icon for borrowed status', () => {
    render(<StatusIcon status="borrowed" />);
    expect(screen.getByRole('img', { name: 'Borrowed' })).toBeInTheDocument();
  });

  it('renders icon for overdue status', () => {
    render(<StatusIcon status="overdue" />);
    expect(screen.getByRole('img', { name: 'Overdue' })).toBeInTheDocument();
  });

  it('is case-insensitive', () => {
    render(<StatusIcon status="ACTIVE" />);
    expect(screen.getByRole('img', { name: 'Active' })).toBeInTheDocument();
  });

  it('falls back to text for unknown status', () => {
    render(<StatusIcon status="unknown" />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('shows Unknown for empty status', () => {
    render(<StatusIcon status="" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
