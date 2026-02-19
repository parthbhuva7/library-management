'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('ErrorBoundary caught error:', error);
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>
            An unexpected error occurred. Please try again.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={this.resetErrorBoundary}
              className={styles.retryButton}
            >
              Retry
            </button>
            <Link href="/books" className={styles.homeLink}>
              Books
            </Link>
            <Link href="/" className={styles.homeLink}>
              Go home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
