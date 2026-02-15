'use client';

import Nav from './Nav';

const PAGE_STYLE: React.CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={PAGE_STYLE}>
      <Nav />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
