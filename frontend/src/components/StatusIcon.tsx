'use client';

import React from 'react';
import {
  CheckCircle,
  RotateCcw,
  BookOpen,
  BookMarked,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import styles from '@/styles/StatusIcon.module.css';

const STATUS_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  active: { icon: CheckCircle, label: 'Active' },
  returned: { icon: RotateCcw, label: 'Returned' },
  available: { icon: BookOpen, label: 'Available' },
  borrowed: { icon: BookMarked, label: 'Borrowed' },
  overdue: { icon: AlertCircle, label: 'Overdue' },
};

interface StatusIconProps {
  status: string;
  size?: number;
}

export default function StatusIcon({ status, size = 18 }: StatusIconProps) {
  const normalized = status?.toLowerCase().trim() || '';
  const config = STATUS_CONFIG[normalized];

  if (!config) {
    return (
      <span className={styles.fallback} title={status || 'Unknown'}>
        {status || 'Unknown'}
      </span>
    );
  }

  const Icon = config.icon;

  const colorClass =
    normalized in styles ? (styles as Record<string, string>)[normalized] : '';

  return (
    <span
      className={`${styles.statusIcon} ${colorClass}`.trim()}
      role="img"
      aria-label={config.label}
      title={config.label}
    >
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}
