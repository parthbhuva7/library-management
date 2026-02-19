'use client';

import Link from 'next/link';
import styles from '@/styles/EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({
  message,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <p className={styles.wrapper}>
      {message}
      {actionHref && actionLabel && (
        <>
          {' '}
          <Link href={actionHref} className={styles.link}>
            {actionLabel}
          </Link>
        </>
      )}
    </p>
  );
}
