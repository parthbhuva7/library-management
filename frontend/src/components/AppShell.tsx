'use client';

import { usePathname } from 'next/navigation';
import PageLayout from './PageLayout';

const NO_NAV_PATHS = ['/login', '/'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const show_nav = !NO_NAV_PATHS.includes(pathname);

  if (show_nav) {
    return <PageLayout>{children}</PageLayout>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>{children}</div>
  );
}
