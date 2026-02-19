'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Page.module.css';
import { Member } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';
import IconButton from '@/components/IconButton';
import SearchField from '@/components/SearchField';
import { Pencil } from 'lucide-react';
import PaginationControls, {
  DEFAULT_PAGE_SIZE,
} from '@/components/PaginationControls';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
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
    LibraryService.listMembers(page, limit, searchQuery || undefined)
      .then((resp) => {
        setMembers(resp.getMembersList());
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
    searchQuery && members.length === 0
      ? 'No members match your search.'
      : 'No members yet.';
  const emptyActionHref = searchQuery ? undefined : '/members/new';
  const emptyActionLabel = searchQuery ? undefined : 'Add Member';

  return (
    <div>
      <div className={styles.tableHeader}>
        <PageTitle>Members</PageTitle>
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Search members..."
        />
      </div>
      <div className={styles.actions}>
        <PageLink href="/members/new">Add Member</PageLink>
      </div>
      <List
        headers={['Name', 'Email', 'Actions']}
        columnWidths={['minmax(120px, 2fr)', 'minmax(100px, 1fr)', 'min-content']}
        alignments={['left', 'left', 'center']}
      >
        {members.map((m) => (
          <ListItem key={m.getId()}>
            <ListCell>{m.getName()}</ListCell>
            <ListCell>{m.getEmail()}</ListCell>
            <ListCell truncate={false} align="center">
              <IconButton
                icon={Pencil}
                ariaLabel="Edit member"
                title="Edit member"
                href={`/members/${m.getId()}`}
              />
            </ListCell>
          </ListItem>
        ))}
      </List>
      {members.length === 0 && !loading && (
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
