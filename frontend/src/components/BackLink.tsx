'use client';

import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children?: React.ReactNode;
}

export default function BackLink({ href, children = 'Back' }: BackLinkProps) {
  return (
    <Link
      href={href}
      style={{
        color: 'var(--muted)',
        marginBottom: 'var(--space-4)',
        display: 'inline-block',
      }}
    >
      {children}
    </Link>
  );
}
