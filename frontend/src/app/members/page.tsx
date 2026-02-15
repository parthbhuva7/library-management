'use client';

import { useState, useEffect } from 'react';
import {
  ListMembersRequest,
  PaginationRequest,
  Member,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import List, { ListItem, ListCell } from '@/components/List';
import EmptyState from '@/components/EmptyState';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import PageLink from '@/components/PageLink';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const req = new ListMembersRequest();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(100);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listMembers(req, get_auth_metadata())
      .then((resp) => setMembers(resp.getMembersList()))
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
      <PageTitle>Members</PageTitle>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <PageLink href="/members/new">Add Member</PageLink>
      </div>
      <List headers={['Name', 'Email', 'Actions']}>
        {members.map((m) => (
          <ListItem key={m.getId()}>
            <ListCell>{m.getName()}</ListCell>
            <ListCell>{m.getEmail()}</ListCell>
            <ListCell truncate={false}>
              <PageLink href={`/members/${m.getId()}`}>Edit</PageLink>
            </ListCell>
          </ListItem>
        ))}
      </List>
      {members.length === 0 && (
        <EmptyState
          message="No members yet."
          actionHref="/members/new"
          actionLabel="Add Member"
        />
      )}
    </div>
  );
}
