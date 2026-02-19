'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Page.module.css';
import { Borrow } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import SearchField from '@/components/SearchField';
import StatusIcon from '@/components/StatusIcon';
import PaginationControls, {
  DEFAULT_PAGE_SIZE,
} from '@/components/PaginationControls';

export default function BorrowingsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    LibraryService.listBorrowings(page, limit, searchQuery || undefined)
      .then((resp) => {
        setBorrows(resp.getBorrowsList());
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
  }, [page, limit, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const emptyMessage =
    searchQuery && borrows.length === 0
      ? 'No borrowings match your search.'
      : 'No borrowings yet.';
  const emptyActionHref = searchQuery ? undefined : '/borrow';
  const emptyActionLabel = searchQuery ? undefined : 'Record Borrow';

  return (
    <div>
      <div className={styles.tableHeader}>
        <PageTitle>Current Borrowings</PageTitle>
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Search borrowings..."
        />
      </div>
      <div className={styles.actions}>
        <PageLink href="/borrow">Record Borrow</PageLink>
        {' | '}
        <PageLink href="/return">Record Return</PageLink>
      </div>
      <List
        headers={['Book', 'Member', 'Copy', 'Status']}
        columnWidths={[
          'minmax(120px, 2fr)',
          'minmax(100px, 1fr)',
          'minmax(60px, min-content)',
          'min-content',
        ]}
        alignments={['left', 'left', 'right', 'center']}
      >
        {borrows.map((b) => {
          const book = b.getBook();
          const member = b.getMember();
          return (
            <ListItem key={b.getId()}>
              <ListCell>
                {book ? `${book.getTitle()} - ${book.getAuthor()}` : 'Book'}
              </ListCell>
              <ListCell>{member ? member.getName() : 'Member'}</ListCell>
              <ListCell align="right">{b.getCopyId()}</ListCell>
              <ListCell truncate={false} align="center">
                {b.getStatus() || 'active'}
              </ListCell>
            </ListItem>
          );
        })}
      </List>
      {borrows.length === 0 && !loading && (
        <EmptyState
          message={emptyMessage}
          actionHref={emptyActionHref}
          actionLabel={emptyActionLabel}
        />
      )}
      {totalCount > 0 && (
        <PaginationControls
          page={page}
          limit={limit}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
