'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Page.module.css';
import { LibraryService } from '@/services/library-service';
import { handle_grpc_error } from '@/lib/grpc-error-handler';
import {
  trim_whitespace,
  validate_required,
  get_validation_errors,
} from '@/lib/form-validation';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/PageTitle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = get_validation_errors({
      username,
      password,
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    const trimmedUsername = trim_whitespace(username);
    const trimmedPassword = trim_whitespace(password);
    try {
      const response = await LibraryService.login(trimmedUsername, trimmedPassword);
      const token = response.getToken();
      if (token) {
        localStorage.setItem('token', token);
        router.push('/books');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(handle_grpc_error(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <PageTitle>Library Staff Login</PageTitle>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          type="text"
          value={username}
          onChange={setUsername}
          required
          error={fieldErrors.username}
          onValidate={(v) => validate_required(v, 'Username')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({
              ...prev,
              username: err ?? '',
            }))
          }
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          error={fieldErrors.password}
          onValidate={(v) => validate_required(v, 'Password')}
          validateOnChange
          onValidationChange={(err) =>
            setFieldErrors((prev) => ({
              ...prev,
              password: err ?? '',
            }))
          }
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>
    </div>
  );
}
