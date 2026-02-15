'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  UpdateBookRequest,
  ListBooksRequest,
  PaginationRequest,
} from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const req = new ListBooksRequest();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(1000);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listBooks(req, get_auth_metadata())
      .then((resp) => {
        const book = resp.getBooksList().find((b) => b.getId() === id);
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
    const request = new UpdateBookRequest();
    request.setId(id);
    request.setTitle(title);
    request.setAuthor(author);
    const client = get_library_client();
    try {
      await client.updateBook(request, get_auth_metadata());
      router.push('/books');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <BackLink href="/books" />
      <PageTitle>Edit Book</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Title"
          name="title"
          value={title}
          onChange={setTitle}
          required
        />
        <FormField
          label="Author"
          name="author"
          value={author}
          onChange={setAuthor}
          required
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
