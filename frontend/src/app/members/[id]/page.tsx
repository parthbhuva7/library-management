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

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
    LibraryService.listMembers(1, 1000)
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
    const errors = get_validation_errors({ name, email });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await LibraryService.updateMember(id, trim_whitespace(name), trim_whitespace(email));
      router.push('/members');
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
      <BackLink href="/members" />
      <PageTitle>Edit Member</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          required
          error={fieldErrors.name}
          onValidate={(v) => validate_required(v, 'Name')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({ ...prev, name: err ?? '' }))
          }
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={fieldErrors.email}
          onValidate={(v) => validate_required(v, 'Email')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({ ...prev, email: err ?? '' }))
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
