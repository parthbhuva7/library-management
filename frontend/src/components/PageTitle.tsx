'use client';

import styles from '@/styles/PageTitle.module.css';

interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return <h1 className={styles.title}>{children}</h1>;
}
