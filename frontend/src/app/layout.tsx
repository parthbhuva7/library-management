import './globals.css';
import AppShell from '@/components/AppShell';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'Library Management',
  description: 'Neighborhood library management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
