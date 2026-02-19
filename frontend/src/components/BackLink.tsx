'use client';

import Link from 'next/link';
import styles from '@/styles/BackLink.module.css';

interface BackLinkProps {
  href: string;
  children?: React.ReactNode;
}

export default function BackLink({ href, children = 'Back' }: BackLinkProps) {
  return <Link href={href} className={styles.link}>{children}</Link>;
}
