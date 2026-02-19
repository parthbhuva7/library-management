'use client';

import Button from '@/components/Button';
import styles from '@/styles/SearchField.module.css';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchField({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
}: SearchFieldProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        aria-label="Search"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
