'use client';

import styles from '@/styles/ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className={styles.wrapper}>{message}</p>;
}
