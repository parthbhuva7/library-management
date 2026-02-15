'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateMemberRequest } from '@/generated';
import { get_library_client, get_auth_metadata } from '@/lib/grpc-client';
import { handle_grpc_error, is_auth_error } from '@/lib/grpc-error-handler';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';
import BackLink from '@/components/BackLink';

export default function NewMemberPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const request = new CreateMemberRequest();
    request.setName(name);
    request.setEmail(email);
    const client = get_library_client();
    try {
      await client.createMember(request, get_auth_metadata());
      router.push('/members');
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
      <BackLink href="/members" />
      <PageTitle>Add Member</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
