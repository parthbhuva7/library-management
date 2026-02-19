'use client';

import Link from 'next/link';
import styles from '@/styles/PageLink.module.css';

interface PageLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function PageLink({ href, children }: PageLinkProps) {
  return <Link href={href} className={styles.link}>{children}</Link>;
}
