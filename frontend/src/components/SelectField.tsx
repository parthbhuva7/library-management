'use client';

import React from 'react';
import styles from '@/styles/Select.module.css';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  error,
}: SelectFieldProps) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={styles.select}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
