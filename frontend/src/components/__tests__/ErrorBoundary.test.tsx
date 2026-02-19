import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });

  it('calls console.error when error is caught', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(consoleSpy).toHaveBeenCalledWith('ErrorBoundary caught error:', expect.any(Error));
  });

  it('retry button resets error state and re-renders children', () => {
    let shouldThrow = true;
    const ConditionalThrow = () => {
      if (shouldThrow) throw new Error('Test');
      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
