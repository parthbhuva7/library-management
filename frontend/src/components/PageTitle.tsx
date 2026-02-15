'use client';

interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <h1
      style={{
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--font-size-lg)',
      }}
    >
      {children}
    </h1>
  );
}
