'use client';

import { useState, useEffect } from 'react';
import { BookCopy } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import Button from '@/components/Button';
import StatusIcon from '@/components/StatusIcon';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import PaginationControls, {
  DEFAULT_PAGE_SIZE,
} from '@/components/PaginationControls';
import styles from '@/styles/CopiesModal.module.css';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    LibraryService.listCopiesByBook(bookId, page, limit)
      .then((resp) => {
        setCopies(resp.getCopiesList());
        const pagination = resp.getPagination();
        setTotalCount(pagination ? pagination.getTotalCount() : 0);
      })
      .catch((err) => {
        if (is_auth_error(err)) {
          window.location.href = '/login';
          return;
        }
        setError(handle_grpc_error(err));
      })
      .finally(() => setLoading(false));
  }, [bookId, page, limit]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h2 className={styles.header}>Copies for: {bookTitle}</h2>
          <Button onClick={onClose}>Close</Button>
        </div>
        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && copies.length === 0 && (
          <p className={styles.emptyText}>No copies yet.</p>
        )}
        {!loading && !error && copies.length > 0 && (
          <>
            <List
              headers={['Copy ID', 'Copy Number', 'Status']}
              columnWidths={[
                'minmax(80px, 1fr)',
                'minmax(80px, min-content)',
                'min-content',
              ]}
              alignments={['left', 'right', 'center']}
            >
              {copies.map((c) => (
                <ListItem key={c.getId()}>
                  <ListCell>{c.getId()}</ListCell>
                  <ListCell align="right">{c.getCopyNumber() || '—'}</ListCell>
                  <ListCell truncate={false} align="center">
                    {c.getStatus() || 'Unknown'}
                  </ListCell>
                </ListItem>
              ))}
            </List>
            {totalCount > 0 && (
              <PaginationControls
                page={page}
                limit={limit}
                totalCount={totalCount}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
