'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import styles from '@/styles/IconButton.module.css';

const DEFAULT_ICON_SIZE = 18;

interface IconButtonBaseProps {
  icon: LucideIcon;
  ariaLabel: string;
  title?: string;
  iconSize?: number;
}

interface IconButtonAsButton extends IconButtonBaseProps {
  href?: never;
  onClick: () => void;
}

interface IconButtonAsLink extends IconButtonBaseProps {
  href: string;
  onClick?: never;
}

type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

export default function IconButton({
  icon: Icon,
  ariaLabel,
  title,
  iconSize = DEFAULT_ICON_SIZE,
  ...props
}: IconButtonProps) {
  const label = title ?? ariaLabel;

  if ('href' in props && props.href) {
    return (
      <Link
        href={props.href}
        className={styles.iconButton}
        aria-label={ariaLabel}
        title={label}
      >
        <Icon size={iconSize} aria-hidden />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={'onClick' in props ? props.onClick : undefined}
      aria-label={ariaLabel}
      title={label}
    >
      <Icon size={iconSize} aria-hidden />
    </button>
  );
}
