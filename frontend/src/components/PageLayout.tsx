'use client';

import Nav from './Nav';
import styles from '@/styles/PageLayout.module.css';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <Nav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
