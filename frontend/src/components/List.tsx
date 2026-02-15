'use client';

const LIST_STYLE: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  minWidth: 400,
  overflowX: 'auto',
};

const ROW_STYLE: React.CSSProperties = {
  display: 'contents',
};

const HEADER_ROW_STYLE: React.CSSProperties = {
  ...ROW_STYLE,
};

const CELL_BASE_STYLE: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const HEADER_CELL_STYLE: React.CSSProperties = {
  ...CELL_BASE_STYLE,
  padding: 'var(--space-2)',
  borderBottom: '1px solid var(--border)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'bold',
  backgroundColor: 'var(--border)',
};

const DATA_CELL_STYLE: React.CSSProperties = {
  ...CELL_BASE_STYLE,
  padding: 'var(--space-3) var(--space-2)',
  borderBottom: '1px solid var(--border)',
  fontSize: 'var(--font-size-base)',
};

const TRUNCATE_STYLE: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
};

function get_grid_template_columns(
  column_count: number,
  column_widths?: string[]
): string {
  if (column_widths && column_widths.length === column_count) {
    return column_widths.join(' ');
  }
  return `repeat(${column_count}, minmax(0, 1fr))`;
}

interface ListProps {
  children: React.ReactNode;
  headers?: string[];
  columnWidths?: string[];
}

interface ListItemProps {
  children: React.ReactNode;
}

interface ListCellProps {
  children: React.ReactNode;
  truncate?: boolean;
}

export function Truncate({ children }: { children: React.ReactNode }) {
  return <span style={TRUNCATE_STYLE}>{children}</span>;
}

export function ListCell({
  children,
  truncate = true,
}: ListCellProps) {
  const content = truncate ? (
    <span style={TRUNCATE_STYLE}>{children}</span>
  ) : (
    children
  );
  const cell_style: React.CSSProperties = truncate
    ? DATA_CELL_STYLE
    : { ...DATA_CELL_STYLE, overflow: 'visible' };
  return <span style={cell_style}>{content}</span>;
}

export function ListItem({ children }: ListItemProps) {
  return <li style={ROW_STYLE}>{children}</li>;
}

export function ListHeader({ headers }: { headers: string[] }) {
  return (
    <li style={HEADER_ROW_STYLE}>
      {headers.map((h, i) => (
        <span key={i} style={HEADER_CELL_STYLE}>
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
}: ListProps) {
  const column_count = headers ? headers.length : 1;
  const grid_template_columns = get_grid_template_columns(
    column_count,
    columnWidths
  );

  const list_style: React.CSSProperties = {
    ...LIST_STYLE,
    gridTemplateColumns: grid_template_columns,
  };

  return (
    <ul style={list_style}>
      {headers && <ListHeader headers={headers} />}
      {children}
    </ul>
  );
}
