'use client';

import { useState, useEffect } from 'react';
import {
  ListBorrowingsRequest,
  PaginationRequest,
  Borrow,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

export default function BorrowingsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageTitle>Current Borrowings</PageTitle>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <PageLink href="/borrow">Record Borrow</PageLink>
        {' | '}
        <PageLink href="/return">Record Return</PageLink>
      </div>
      <List headers={['Book', 'Member', 'Copy', 'Status']}>
        {borrows.map((b) => {
          const book = b.getBook();
          const member = b.getMember();
          return (
            <ListItem key={b.getId()}>
              <ListCell>
                {book ? `${book.getTitle()} - ${book.getAuthor()}` : 'Book'}
              </ListCell>
              <ListCell>{member ? member.getName() : 'Member'}</ListCell>
              <ListCell>{b.getCopyId()}</ListCell>
              <ListCell>{b.getStatus() || 'active'}</ListCell>
            </ListItem>
          );
        })}
      </List>
      {borrows.length === 0 && (
        <EmptyState
          message="No borrowings yet."
          actionHref="/borrow"
          actionLabel="Record Borrow"
        />
      )}
    </div>
  );
}
