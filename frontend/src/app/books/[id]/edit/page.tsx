'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import Loading from '@/components/Loading';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    LibraryService.getBook(id)
      .then((resp) => {
        const book = resp.getBook();
        if (book) {
          setTitle(book.getTitle());
          setAuthor(book.getAuthor());
        }
      })
      .catch((err) => {
        if (is_auth_error(err)) {
          window.location.href = '/login';
          return;
        }
        setError(handle_grpc_error(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = get_validation_errors({ title, author });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await LibraryService.updateBook(
        id,
        trim_whitespace(title),
        trim_whitespace(author)
      );
      router.push(`/books/${id}`);
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

  return (
    <div>
      <BackLink href={id ? `/books/${id}` : '/books'} />
      <PageTitle>Edit Book</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Title"
          name="title"
          value={title}
          onChange={setTitle}
          required
          error={fieldErrors.title}
          onValidate={(v) => validate_required(v, 'Title')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({ ...prev, title: err ?? '' }))
          }
        />
        <FormField
          label="Author"
          name="author"
          value={author}
          onChange={setAuthor}
          required
          error={fieldErrors.author}
          onValidate={(v) => validate_required(v, 'Author')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({ ...prev, author: err ?? '' }))
          }
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={submitting}>
          Save
        </Button>
      </form>
    </div>
  );
}
