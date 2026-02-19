'use client';

import React from 'react';
import { trim_whitespace } from '@/lib/form-validation';
import styles from '@/styles/FormField.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  onValidate?: (value: string) => string | null;
  validateOnChange?: boolean;
  onValidationChange?: (error: string | null) => void;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  error,
  onValidate,
  validateOnChange = false,
  onValidationChange,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    onChange(rawValue);
    if (validateOnChange && onValidate && onValidationChange) {
      const trimmed = trim_whitespace(rawValue);
      const validationError = onValidate(trimmed);
      onValidationChange(validationError);
    }
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className={styles.input}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
