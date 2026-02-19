'use client';

import React from 'react';
import styles from '@/styles/Button.module.css';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  type = 'button',
  children,
  onClick,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={styles.button}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
