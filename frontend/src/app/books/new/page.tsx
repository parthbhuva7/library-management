'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateBookRequest } from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';

export default function NewBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const request = new CreateBookRequest();
    request.setTitle(title);
    request.setAuthor(author);
    const client = get_library_client();
    try {
      await client.createBook(request, get_auth_metadata());
      router.push('/books');
    } catch (err) {
      if (is_auth_error(err)) {
        window.location.href = '/login';
        return;
      }
      setError(handle_grpc_error(err));
    }
  };

  return (
    <div>
      <BackLink href="/books" />
      <PageTitle>Add Book</PageTitle>
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
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
