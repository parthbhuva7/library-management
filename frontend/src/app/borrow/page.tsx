'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailableCopy, Member } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import { validate_required } from '@/lib/form-validation';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';
import Loading from '@/components/Loading';
import SelectField from '@/components/SelectField';

export default function BorrowPage() {
  const [copyId, setCopyId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [copies, setCopies] = useState<AvailableCopy[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    Promise.all([
      LibraryService.listAvailableCopies(1, 100),
      LibraryService.listMembers(1, 100),
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
    const errors: Record<string, string> = {};
    const copyErr = validate_required(copyId, 'Copy');
    const memberErr = validate_required(memberId, 'Member');
    if (copyErr) errors.copyId = copyErr;
    if (memberErr) errors.memberId = memberErr;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await LibraryService.borrowBook(copyId, memberId);
      router.push('/borrowings');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    } finally {
      setSubmitting(false);
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
        <SelectField
          label="Copy"
          name="copyId"
          value={copyId}
          onChange={(v) => {
            setCopyId(v);
            setFieldErrors((prev) => ({ ...prev, copyId: '' }));
          }}
          options={copies.map((c) => ({
            value: c.getId(),
            label: `${c.getBookTitle()} - ${c.getCopyNumber()}`,
          }))}
          placeholder={noCopies ? 'No copies available' : 'Select a copy'}
          disabled={noCopies}
          error={fieldErrors.copyId}
        />
        <SelectField
          label="Member"
          name="memberId"
          value={memberId}
          onChange={(v) => {
            setMemberId(v);
            setFieldErrors((prev) => ({ ...prev, memberId: '' }));
          }}
          options={members.map((m) => ({
            value: m.getId(),
            label: m.getName(),
          }))}
          placeholder={noMembers ? 'No members yet' : 'Select a member'}
          disabled={noMembers}
          error={fieldErrors.memberId}
        />
        {error && <ErrorMessage message={error} />}
        <Button
          type="submit"
          disabled={!canSubmit || noCopies || noMembers}
          loading={submitting}
        >
          Borrow
        </Button>
      </form>
    </div>
  );
}
