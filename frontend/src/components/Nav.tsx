'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/books', label: 'Books' },
  { href: '/members', label: 'Members' },
  { href: '/borrowings', label: 'Borrowings' },
  { href: '/login', label: 'Logout' },
] as const;

export default function Nav() {
  const pathname = usePathname();

  const handle_logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav
      style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      {NAV_LINKS.slice(0, -1).map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            color: pathname.startsWith(href) ? 'var(--foreground)' : 'var(--muted)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-base)',
          }}
        >
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handle_logout}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-base)',
          padding: 0,
        }}
      >
        Logout
      </button>
    </nav>
  );
}
