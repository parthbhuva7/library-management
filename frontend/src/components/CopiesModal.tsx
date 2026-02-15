'use client';

import { useState, useEffect } from 'react';
import {
  ListCopiesByBookRequest,
  PaginationRequest,
  BookCopy,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const MODAL_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 'var(--space-4)',
  maxWidth: 500,
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
};

interface CopiesModalProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
}

export default function CopiesModal({
  bookId,
  bookTitle,
  onClose,
}: CopiesModalProps) {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookId) return;
    const req = new ListCopiesByBookRequest();
    req.setBookId(bookId);
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(100);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listCopiesByBook(req, get_auth_metadata())
      .then((resp) => {
        setCopies(resp.getCopiesList());
      })
      .catch((err) => {
        if (is_auth_error(err)) {
          window.location.href = '/login';
          return;
        }
        setError(handle_grpc_error(err));
      })
      .finally(() => setLoading(false));
  }, [bookId]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={OVERLAY_STYLE} onClick={handleOverlayClick}>
      <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
            Copies for: {bookTitle}
          </h2>
          <Button onClick={onClose}>Close</Button>
        </div>
        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && copies.length === 0 && (
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 'var(--font-size-base)',
              marginTop: 'var(--space-4)',
            }}
          >
            No copies yet.
          </p>
        )}
        {!loading && !error && copies.length > 0 && (
          <List headers={['Copy ID', 'Copy Number', 'Status']}>
            {copies.map((c) => (
              <ListItem key={c.getId()}>
                <ListCell>{c.getId()}</ListCell>
                <ListCell>{c.getCopyNumber() || '—'}</ListCell>
                <ListCell>{c.getStatus() || 'Unknown'}</ListCell>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
}
