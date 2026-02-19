'use client';

import styles from '@/styles/List.module.css';

export type Alignment = 'left' | 'right' | 'center';

function get_grid_template_columns(
  column_count: number,
  column_widths?: string[]
): string {
  if (column_widths && column_widths.length === column_count) {
    return column_widths.join(' ');
  }
  return `repeat(${column_count}, minmax(0, 1fr))`;
}

function getAlignmentClass(align?: Alignment): string {
  if (!align || align === 'left') return styles.alignLeft;
  if (align === 'right') return styles.alignRight;
  return styles.alignCenter;
}

interface ListProps {
  children: React.ReactNode;
  headers?: string[];
  columnWidths?: string[];
  alignments?: Alignment[];
}

interface ListItemProps {
  children: React.ReactNode;
}

interface ListCellProps {
  children: React.ReactNode;
  truncate?: boolean;
  align?: Alignment;
}

export function Truncate({ children }: { children: React.ReactNode }) {
  return <span className={styles.truncate}>{children}</span>;
}

export function ListCell({
  children,
  truncate = true,
  align = 'left',
}: ListCellProps) {
  const content = truncate ? (
    <span className={styles.truncate}>{children}</span>
  ) : (
    children
  );
  const cell_class = truncate
    ? `${styles.dataCell} ${getAlignmentClass(align)}`
    : `${styles.dataCell} ${styles.dataCellNoTruncate} ${getAlignmentClass(align)}`;
  return <span className={cell_class}>{content}</span>;
}

export function ListItem({ children }: ListItemProps) {
  return <li className={styles.row}>{children}</li>;
}

interface ListHeaderProps {
  headers: string[];
  alignments?: Alignment[];
}

export function ListHeader({ headers, alignments }: ListHeaderProps) {
  return (
    <li className={styles.row}>
      {headers.map((h, i) => (
        <span
          key={i}
          className={`${styles.headerCell} ${getAlignmentClass(alignments?.[i])}`}
        >
          {h}
        </span>
      ))}
    </li>
  );
}

export default function List({
  children,
  headers,
  columnWidths,
  alignments,
}: ListProps) {
  const column_count = headers ? headers.length : 1;
  const grid_template_columns = get_grid_template_columns(
    column_count,
    columnWidths
  );

  return (
    <ul
      className={styles.list}
      style={
        { '--list-grid-cols': grid_template_columns } as React.CSSProperties
      }
    >
      {headers && <ListHeader headers={headers} alignments={alignments} />}
      {children}
    </ul>
  );
}
