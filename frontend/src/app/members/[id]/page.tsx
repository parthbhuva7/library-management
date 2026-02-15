'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  UpdateMemberRequest,
  ListMembersRequest,
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

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const req = new ListMembersRequest();
    const pagination = new PaginationRequest();
    pagination.setPage(1);
    pagination.setLimit(1000);
    req.setPagination(pagination);
    const client = get_library_client();
    client
      .listMembers(req, get_auth_metadata())
      .then((resp) => {
        const member = resp.getMembersList().find((m) => m.getId() === id);
        if (member) {
          setName(member.getName());
          setEmail(member.getEmail());
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
    const request = new UpdateMemberRequest();
    request.setId(id);
    request.setName(name);
    request.setEmail(email);
    const client = get_library_client();
    try {
      await client.updateMember(request, get_auth_metadata());
      router.push('/members');
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
      <BackLink href="/members" />
      <PageTitle>Edit Member</PageTitle>
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
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
