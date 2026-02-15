'use client';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  type = 'button',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        fontSize: 'var(--font-size-base)',
        background: 'var(--foreground)',
        color: 'var(--background)',
        border: 'none',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
