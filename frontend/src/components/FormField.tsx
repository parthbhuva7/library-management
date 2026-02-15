'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 300,
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-base)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}
      />
    </div>
  );
}
