import { type ReactNode } from 'react';
import { Pagination, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import clsx from 'clsx';
import { Table } from './Table.tsx';

export interface DataTableColumn<Row> {
  /** Column key, used for the React key. */
  key: string;
  /** Header label. */
  header: ReactNode;
  /** Cell renderer for a row. */
  render: (row: Row) => ReactNode;
  /** Right-align (for numbers). */
  numeric?: boolean;
  /** Monospace cell (for ids). */
  mono?: boolean;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Stable key per row. */
  rowKey: (row: Row) => string;

  /** Show the search box. The parent owns filtering via search/onSearchChange. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  /** A slot for filter controls (Select, SegmentedControl) in the toolbar. */
  filters?: ReactNode;

  /** Pagination: current page (1-based) and total pages. Omit to hide. */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  /** A short summary shown on the left of the footer, e.g. "142 runs". */
  summary?: ReactNode;

  /** Shown when rows is empty. */
  emptyLabel?: ReactNode;

  className?: string;
}

/**
 * DataTable wraps the dense Table with a toolbar (search + a filter slot) and a
 * footer (a summary and pagination). Filtering, searching and paging are
 * controlled: the parent holds the data and responds to the search, filter and
 * page callbacks, so the table stays a pure presentation of the current page.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters,
  page,
  totalPages,
  onPageChange,
  summary,
  emptyLabel = 'Nothing to show',
  className,
}: DataTableProps<Row>) {
  const showToolbar = onSearchChange != null || filters != null;
  const showFooter = summary != null || (page != null && totalPages != null && totalPages > 1);

  return (
    <div className={clsx('upmo-datatable', className)}>
      {showToolbar ? (
        <div className="upmo-datatable__toolbar">
          {onSearchChange != null ? (
            <TextInput
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
              placeholder={searchPlaceholder}
              leftSection={<IconSearch size={16} />}
              classNames={{ input: 'upmo-input' }}
              className="upmo-datatable__search"
              aria-label={searchPlaceholder}
            />
          ) : null}
          {filters ? <div className="upmo-datatable__filters">{filters}</div> : null}
        </div>
      ) : null}

      <Table.ScrollContainer minWidth={480}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key} style={col.numeric ? { textAlign: 'right' } : undefined}>
                  {col.header}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text c="dimmed" ta="center" py="lg">
                    {emptyLabel}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((row) => (
                <Table.Tr key={rowKey(row)}>
                  {columns.map((col) => {
                    const content = col.render(row);
                    if (col.numeric) return <Table.Num key={col.key}>{content}</Table.Num>;
                    if (col.mono) return <Table.Mono key={col.key}>{content}</Table.Mono>;
                    return <Table.Td key={col.key}>{content}</Table.Td>;
                  })}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {showFooter ? (
        <div className="upmo-datatable__footer">
          <Text size="sm" c="dimmed">
            {summary}
          </Text>
          {page != null && totalPages != null && totalPages > 1 ? (
            <Pagination
              value={page}
              total={totalPages}
              onChange={onPageChange}
              size="sm"
              radius="xs"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
