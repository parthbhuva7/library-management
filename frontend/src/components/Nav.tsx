'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/Nav.module.css';

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
    <nav className={styles.nav}>
      {NAV_LINKS.slice(0, -1).map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={pathname.startsWith(href) ? styles.link : styles.linkMuted}
        >
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handle_logout}
        className={styles.logoutButton}
      >
        Logout
      </button>
    </nav>
  );
}
