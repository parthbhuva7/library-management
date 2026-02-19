'use client';

import React from 'react';
import Button from './Button';
import styles from '@/styles/PaginationControls.module.css';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

interface PaginationControlsProps {
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number, limit: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (limit: number) => void;
}

export default function PaginationControls({
  page,
  limit,
  totalCount,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    onPageSizeChange?.(newLimit);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        Showing {startItem}-{endItem} of {totalCount}
      </span>
      <div className={styles.controls}>
        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <label className={styles.pageSizeLabel}>
            Rows per page:
            <select
              value={limit}
              onChange={handlePageSizeChange}
              className={styles.pageSizeSelect}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className={styles.buttons}>
        <Button
          type="button"
          onClick={() => onPageChange(page - 1, limit)}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <span className={styles.pageIndicator}>
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          onClick={() => onPageChange(page + 1, limit)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
      </div>
    </div>
  );
}

export { DEFAULT_PAGE_SIZE };
