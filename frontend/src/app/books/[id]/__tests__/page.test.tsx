/**
 * Tests for book detail page.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookDetailPage from '../page';
import { LibraryService } from '@/services/library-service';
import * as grpcErrorHandler from '@/lib/grpc-error-handler';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'book-123' })),
}));

vi.mock('@/services/library-service', () => ({
  LibraryService: {
    getBook: vi.fn(),
  },
}));

vi.mock('@/lib/grpc-error-handler', () => ({
  handle_grpc_error: vi.fn((msg: string) => msg),
  is_auth_error: vi.fn(() => false),
  is_not_found_error: vi.fn(() => false),
}));

describe('BookDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(() => 'token') },
      writable: true,
    });
  });

  it('displays book title, author, and copy count when loaded', async () => {
    const mockBook = {
      getTitle: () => 'Test Book',
      getAuthor: () => 'Test Author',
      getCopyCount: () => 3,
    };
    vi.mocked(LibraryService.getBook).mockResolvedValue({
      getBook: () => mockBook,
    } as never);

    render(<BookDetailPage />);

    expect(await screen.findByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('shows Edit link to edit page', async () => {
    const mockBook = {
      getTitle: () => 'Test Book',
      getAuthor: () => 'Test Author',
      getCopyCount: () => 0,
    };
    vi.mocked(LibraryService.getBook).mockResolvedValue({
      getBook: () => mockBook,
    } as never);

    render(<BookDetailPage />);

    const editLink = await screen.findByRole('link', { name: 'Edit' });
    expect(editLink).toHaveAttribute('href', '/books/book-123/edit');
  });

  it('shows Back link to books list', async () => {
    const mockBook = {
      getTitle: () => 'Test Book',
      getAuthor: () => 'Test Author',
      getCopyCount: () => 0,
    };
    vi.mocked(LibraryService.getBook).mockResolvedValue({
      getBook: () => mockBook,
    } as never);

    render(<BookDetailPage />);

    const backLink = await screen.findByRole('link', { name: 'Back' });
    expect(backLink).toHaveAttribute('href', '/books');
  });

  it('displays error and BackLink when book not found', async () => {
    vi.mocked(LibraryService.getBook).mockRejectedValue(new Error('Not found'));
    vi.mocked(grpcErrorHandler.is_not_found_error).mockReturnValue(true);
    vi.mocked(grpcErrorHandler.handle_grpc_error).mockReturnValue(
      'Resource not found'
    );

    render(<BookDetailPage />);

    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/books'
    );
    expect(await screen.findByText('Resource not found')).toBeInTheDocument();
  });
});
