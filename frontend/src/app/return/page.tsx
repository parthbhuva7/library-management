'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Borrow } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import { validate_required } from '@/lib/form-validation';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';
import Loading from '@/components/Loading';
import SelectField from '@/components/SelectField';

export default function ReturnPage() {
  const [copyId, setCopyId] = useState('');
  const [borrows, setBorrows] = useState<Borrow[]>([]);
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
    LibraryService.listBorrowings(1, 100)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const copyErr = validate_required(copyId, 'Copy');
    if (copyErr) {
      setFieldErrors({ copyId: copyErr });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await LibraryService.returnBook(copyId);
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

  const noBorrows = !loading && borrows.length === 0;

  if (loading) return <Loading />;
  if (error && borrows.length === 0) return <ErrorMessage message={error} />;

  return (
    <div>
      <BackLink href="/borrowings" />
      <PageTitle>Record Return</PageTitle>
      {noBorrows ? (
        <p>No books currently borrowed.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <SelectField
            label="Copy to return"
            name="copyId"
            value={copyId}
            onChange={(v) => {
              setCopyId(v);
              setFieldErrors((prev) => ({ ...prev, copyId: '' }));
            }}
            options={borrows.map((b) => {
              const book = b.getBook();
              const copy = b.getCopy();
              const member = b.getMember();
              const bookTitle = book ? book.getTitle() : 'Book';
              const copyNum = copy ? copy.getCopyNumber() : b.getCopyId();
              const memberName = member ? member.getName() : 'Member';
              return {
                value: b.getCopyId(),
                label: `${bookTitle} - ${copyNum} - ${memberName}`,
              };
            })}
            placeholder="Select a copy"
            error={fieldErrors.copyId}
          />
          {error && <ErrorMessage message={error} />}
          <Button type="submit" loading={submitting}>
            Return
          </Button>
        </form>
      )}
    </div>
  );
}
