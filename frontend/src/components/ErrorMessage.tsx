'use client';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p
      style={{
        color: 'var(--error)',
        fontSize: 'var(--font-size-base)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {message}
    </p>
  );
}
