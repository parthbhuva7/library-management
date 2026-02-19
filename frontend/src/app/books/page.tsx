'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Page.module.css';
import { Book } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import IconButton from '@/components/IconButton';
import CopiesModal from '@/components/CopiesModal';
import { Eye, Pencil } from 'lucide-react';
import SearchField from '@/components/SearchField';
import PaginationControls, {
  DEFAULT_PAGE_SIZE,
} from '@/components/PaginationControls';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalBook, setModalBook] = useState<{ id: string; title: string } | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    LibraryService.listBooks(page, limit, searchQuery || undefined)
      .then((resp) => {
        setBooks(resp.getBooksList());
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
    searchQuery && books.length === 0
      ? 'No books match your search.'
      : 'No books yet.';
  const emptyActionHref = searchQuery ? undefined : '/books/new';
  const emptyActionLabel = searchQuery ? undefined : 'Add Book';

  return (
    <div>
      <div className={styles.tableHeader}>
        <PageTitle>Books</PageTitle>
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Search books..."
        />
      </div>
      <div className={styles.actions}>
        <PageLink href="/books/new">Add Book</PageLink>
        {' | '}
        <PageLink href="/books/copies/new">Add Copy</PageLink>
      </div>
      <List
        headers={['Title', 'Author', 'Copies', 'Actions']}
        columnWidths={[
          'minmax(120px, 2fr)',
          'minmax(100px, 1fr)',
          'minmax(80px, min-content)',
          'min-content',
        ]}
        alignments={['left', 'left', 'center', 'center']}
      >
        {books.map((b) => (
          <ListItem key={b.getId()}>
            <ListCell>
              <PageLink href={`/books/${b.getId()}`}>{b.getTitle()}</PageLink>
            </ListCell>
            <ListCell>{b.getAuthor()}</ListCell>
            <ListCell truncate={false} align="center">
              <span className={styles.actionsInline}>
                <span>{b.getCopyCount()}</span>
                <IconButton
                  icon={Eye}
                  ariaLabel="View copies"
                  title="View copies"
                  onClick={() =>
                    setModalBook({ id: b.getId(), title: b.getTitle() })
                  }
                />
              </span>
            </ListCell>
            <ListCell truncate={false} align="center">
              <IconButton
                icon={Pencil}
                ariaLabel="Edit book"
                title="Edit book"
                href={`/books/${b.getId()}/edit`}
              />
            </ListCell>
          </ListItem>
        ))}
      </List>
      {books.length === 0 && !loading && (
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
