'use client';

import Link from 'next/link';

interface PageLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function PageLink({ href, children }: PageLinkProps) {
  return (
    <Link
      href={href}
      style={{
        color: 'var(--foreground)',
        textDecoration: 'underline',
      }}
    >
      {children}
    </Link>
  );
}
