'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/generated';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import {
  trim_whitespace,
  validate_required,
  get_validation_errors,
} from '@/lib/form-validation';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';
import PageLink from '@/components/PageLink';
import Loading from '@/components/Loading';
import SelectField from '@/components/SelectField';
import styles from '@/styles/Page.module.css';

export default function NewBookCopyPage() {
  const [bookId, setBookId] = useState('');
  const [copyNumber, setCopyNumber] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
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
    LibraryService.listBooks(1, 100)
      .then((resp) => setBooks(resp.getBooksList()))
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
    if (!trim_whitespace(bookId)) {
      errors.bookId = 'Book is required';
    }
    Object.assign(errors, get_validation_errors({ copyNumber }));
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await LibraryService.createBookCopy(bookId, trim_whitespace(copyNumber));
      router.push('/books');
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

  if (loading) return <Loading />;
  if (error && books.length === 0) return <ErrorMessage message={error} />;

  if (books.length === 0) {
    return (
      <div>
        <BackLink href="/books" />
        <PageTitle>Add Book Copy</PageTitle>
        <p className={styles.paragraph}>
          No books yet. Add a book first.
        </p>
        <PageLink href="/books/new">Add Book</PageLink>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/books" />
      <PageTitle>Add Book Copy</PageTitle>
      <form onSubmit={handleSubmit}>
        <SelectField
          label="Book"
          name="bookId"
          value={bookId}
          onChange={(v) => {
            setBookId(v);
            setFieldErrors((prev) => ({ ...prev, bookId: '' }));
          }}
          options={books.map((b) => ({
            value: b.getId(),
            label: `${b.getTitle()} by ${b.getAuthor()}`,
          }))}
          placeholder="Select a book"
          error={fieldErrors.bookId}
        />
        <FormField
          label="Copy number"
          name="copyNumber"
          value={copyNumber}
          onChange={setCopyNumber}
          required
          error={fieldErrors.copyNumber}
          onValidate={(v) => validate_required(v, 'Copy number')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({ ...prev, copyNumber: err ?? '' }))
          }
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={submitting}>
          Add Copy
        </Button>
      </form>
    </div>
  );
}
