'use client';

import { usePathname } from 'next/navigation';
import PageLayout from './PageLayout';
import styles from '@/styles/AppShell.module.css';

const NO_NAV_PATHS = ['/login', '/'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const show_nav = !NO_NAV_PATHS.includes(pathname);

  if (show_nav) {
    return <PageLayout>{children}</PageLayout>;
  }

  return <div className={styles.wrapper}>{children}</div>;
}
