'use client';

import { useState, useEffect } from 'react';
import {
  ListBooksRequest,
  PaginationRequest,
  Book,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import Button from '@/components/Button';
import CopiesModal from '@/components/CopiesModal';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalBook, setModalBook] = useState<{ id: string; title: string } | null>(
    null
  );

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
      .then((resp) => {
        setBooks(resp.getBooksList());
      })
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
      <PageTitle>Books</PageTitle>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <PageLink href="/books/new">Add Book</PageLink>
        {' | '}
        <PageLink href="/books/copies/new">Add Copy</PageLink>
      </div>
      <List headers={['Title', 'Author', 'Copies', 'Actions']}>
        {books.map((b) => (
          <ListItem key={b.getId()}>
            <ListCell>{b.getTitle()}</ListCell>
            <ListCell>{b.getAuthor()}</ListCell>
            <ListCell truncate={false}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span>{b.getCopyCount()}</span>
                <Button
                  onClick={() =>
                    setModalBook({ id: b.getId(), title: b.getTitle() })
                  }
                >
                  View
                </Button>
              </span>
            </ListCell>
            <ListCell truncate={false}>
              <PageLink href={`/books/${b.getId()}`}>Edit</PageLink>
            </ListCell>
          </ListItem>
        ))}
      </List>
      {books.length === 0 && (
        <EmptyState
          message="No books yet."
          actionHref="/books/new"
          actionLabel="Add Book"
        />
      )}
      {modalBook && (
        <CopiesModal
          bookId={modalBook.id}
          bookTitle={modalBook.title}
          onClose={() => setModalBook(null)}
        />
      )}
    </div>
  );
}
