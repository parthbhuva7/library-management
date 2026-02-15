'use client';

import Link from 'next/link';

interface EmptyStateProps {
  message: string;
  actionHref: string;
  actionLabel: string;
}

export default function EmptyState({
  message,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <p
      style={{
        color: 'var(--muted)',
        fontSize: 'var(--font-size-base)',
        marginTop: 'var(--space-5)',
      }}
    >
      {message}{' '}
      <Link
        href={actionHref}
        style={{
          color: 'var(--foreground)',
          textDecoration: 'underline',
        }}
      >
        {actionLabel}
      </Link>
    </p>
  );
}
