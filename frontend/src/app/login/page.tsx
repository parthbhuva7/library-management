'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginRequest } from '@/generated';
import { get_library_client } from '@/lib/grpc-client';
import { handle_grpc_error } from '@/lib/grpc-error-handler';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const request = new LoginRequest();
    request.setUsername(username);
    request.setPassword(password);
    const client = get_library_client();
    try {
      const response = await client.login(request, {});
      const token = response.getToken();
      if (token) {
        localStorage.setItem('token', token);
        router.push('/books');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(handle_grpc_error(err));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto 0' }}>
      <PageTitle>Library Staff Login</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          type="text"
          value={username}
          onChange={setUsername}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
