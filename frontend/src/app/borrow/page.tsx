'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BorrowBookRequest,
  ListAvailableCopiesRequest,
  ListMembersRequest,
  PaginationRequest,
  AvailableCopy,
  Member,
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

export default function BorrowPage() {
  const [copyId, setCopyId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [copies, setCopies] = useState<AvailableCopy[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const client = get_library_client();
    const meta = get_auth_metadata();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(100);

    const copiesReq = new ListAvailableCopiesRequest();
    copiesReq.setPagination(pagination);
    const membersReq = new ListMembersRequest();
    membersReq.setPagination(pagination);

    Promise.all([
      client.listAvailableCopies(copiesReq, meta),
      client.listMembers(membersReq, meta),
    ])
      .then(([copiesResp, membersResp]) => {
        setCopies(copiesResp.getCopiesList());
        setMembers(membersResp.getMembersList());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const request = new BorrowBookRequest();
    request.setCopyId(copyId);
    request.setMemberId(memberId);
    const client = get_library_client();
    try {
      await client.borrowBook(request, get_auth_metadata());
      router.push('/borrowings');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    }
  };

  const canSubmit = copyId && memberId;
  const noCopies = !loading && copies.length === 0;
  const noMembers = !loading && members.length === 0;

  if (loading) return <Loading />;
  if (error && copies.length === 0 && members.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <BackLink href="/borrowings" />
      <PageTitle>Record Borrow</PageTitle>
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
            Copy
          </label>
          <select
            id="copyId"
            name="copyId"
            value={copyId}
            onChange={(e) => setCopyId(e.target.value)}
            required
            disabled={noCopies}
            style={SELECT_STYLE}
          >
            <option value="">
              {noCopies ? 'No copies available' : 'Select a copy'}
            </option>
            {copies.map((c) => (
              <option key={c.getId()} value={c.getId()}>
                {c.getBookTitle()} - {c.getCopyNumber()}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label
            htmlFor="memberId"
            style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            Member
          </label>
          <select
            id="memberId"
            name="memberId"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            disabled={noMembers}
            style={SELECT_STYLE}
          >
            <option value="">
              {noMembers ? 'No members yet' : 'Select a member'}
            </option>
            {members.map((m) => (
              <option key={m.getId()} value={m.getId()}>
                {m.getName()}
              </option>
            ))}
          </select>
        </div>
        {error && <ErrorMessage message={error} />}
        <Button type="submit" disabled={!canSubmit || noCopies || noMembers}>
          Borrow
        </Button>
      </form>
    </div>
  );
}
