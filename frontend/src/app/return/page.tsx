'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReturnBookRequest,
  ListBorrowingsRequest,
  PaginationRequest,
  Borrow,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';
import Loading from '@/components/Loading';

const SELECT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: 300,
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--font-size-base)',
  border: '1px solid var(--border)',
  borderRadius: 4,
};

export default function ReturnPage() {
  const [copyId, setCopyId] = useState('');
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const req = new ListBorrowingsRequest();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(100);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listBorrowings(req, get_auth_metadata())
      .then((resp) => setBorrows(resp.getBorrowsList()))
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
    const request = new ReturnBookRequest();
    request.setCopyId(copyId);
    const client = get_library_client();
    try {
      await client.returnBook(request, get_auth_metadata());
      router.push('/borrowings');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    }
  };

  const noBorrows = !loading && borrows.length === 0;

  if (loading) return <Loading />;
  if (error && borrows.length === 0) return <ErrorMessage message={error} />;

  return (
    <div>
      <BackLink href="/borrowings" />
      <PageTitle>Record Return</PageTitle>
      {noBorrows ? (
        <p>No books currently borrowed.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="copyId"
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)',
              }}
            >
              Copy to return
            </label>
            <select
              id="copyId"
              name="copyId"
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
              required
              style={SELECT_STYLE}
            >
              <option value="">Select a copy</option>
              {borrows.map((b) => {
                const book = b.getBook();
                const copy = b.getCopy();
                const member = b.getMember();
                const bookTitle = book ? book.getTitle() : 'Book';
                const copyNum = copy ? copy.getCopyNumber() : b.getCopyId();
                const memberName = member ? member.getName() : 'Member';
                return (
                  <option key={b.getId()} value={b.getCopyId()}>
                    {bookTitle} - {copyNum} - {memberName}
                  </option>
                );
              })}
            </select>
          </div>
          {error && <ErrorMessage message={error} />}
          <Button type="submit">Return</Button>
        </form>
      )}
    </div>
  );
}
