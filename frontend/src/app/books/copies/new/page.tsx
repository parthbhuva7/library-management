'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreateBookCopyRequest,
  ListBooksRequest,
  PaginationRequest,
  Book,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';
import PageLink from '@/components/PageLink';
import Loading from '@/components/Loading';

export default function NewBookCopyPage() {
  const [bookId, setBookId] = useState('');
  const [copyNumber, setCopyNumber] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const req = new ListBooksRequest();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(100);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listBooks(req, get_auth_metadata())
      .then((resp) => setBooks(resp.getBooksList()))
      .catch((err) => {
        if (is_auth_error(err)) {
          window.location.href = '/login';
          return;
        }
        setError(handle_grpc_error(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const request = new CreateBookCopyRequest();
    request.setBookId(bookId);
    request.setCopyNumber(copyNumber);
    const client = get_library_client();
    try {
      await client.createBookCopy(request, get_auth_metadata());
      router.push('/books');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    }
  };

  if (loading) return <Loading />;
  if (error && books.length === 0) return <ErrorMessage message={error} />;

  if (books.length === 0) {
    return (
      <div>
        <BackLink href="/books" />
        <PageTitle>Add Book Copy</PageTitle>
        <p style={{ marginBottom: 'var(--space-4)' }}>
          No books yet. Add a book first.
        </p>
        <PageLink href="/books/new">Add Book</PageLink>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/books" />
      <PageTitle>Add Book Copy</PageTitle>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label
            htmlFor="bookId"
            style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            Book
          </label>
          <select
            id="bookId"
            name="bookId"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            required
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 300,
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-base)',
              border: '1px solid var(--border)',
              borderRadius: 4,
            }}
          >
            <option value="">Select a book</option>
            {books.map((b) => (
              <option key={b.getId()} value={b.getId()}>
                {b.getTitle()} by {b.getAuthor()}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Copy number"
          name="copyNumber"
          value={copyNumber}
          onChange={setCopyNumber}
          required
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit">Add Copy</Button>
      </form>
    </div>
  );
}
