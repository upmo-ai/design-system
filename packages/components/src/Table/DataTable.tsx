import { useId, type ReactNode } from 'react';
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

  /** Accessible name of the table. Prefer a visible `caption` or `aria-labelledby` when the page has a heading. */
  'aria-label'?: string;
  /** Id of the element that names the table, e.g. the heading above it. */
  'aria-labelledby'?: string;
  /** A visible caption, rendered above the rows as the table's `<caption>`. It also names the table. */
  caption?: ReactNode;
  /**
   * Minimum width of the scrolling table, in px or any CSS length. Below it the
   * table scrolls sideways, inside a focusable region that takes the table's name.
   * Default 480.
   */
  minWidth?: number | string;

  className?: string;
}

/**
 * DataTable wraps the dense Table with a toolbar (search + a filter slot) and a
 * footer (a summary and pagination). Filtering, searching and paging are
 * controlled: the parent holds the data and responds to the search, filter and
 * page callbacks, so the table stays a pure presentation of the current page.
 *
 * Name the table with `caption`, `aria-label` or `aria-labelledby`, so screen
 * reader users can find it among a page's tables. The same name goes on the
 * scrolling region around it, which is a tab stop: a keyboard user focuses it
 * and scrolls sideways with the arrow keys when the table is wider than the page.
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
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  caption,
  minWidth = 480,
  className,
}: DataTableProps<Row>) {
  const captionId = `${useId()}-caption`;
  // The region repeats the table's name: aria-labelledby wins over aria-label,
  // which wins over the caption, as it does for the table itself.
  const regionLabelledBy = ariaLabelledBy ?? (ariaLabel == null && caption != null ? captionId : undefined);
  const named = ariaLabel != null || regionLabelledBy != null;
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

      <Table.ScrollContainer
        minWidth={minWidth}
        // Native scrolling: Mantine's scroll area viewport cannot take focus.
        type="native"
        className="upmo-datatable__scroll"
        tabIndex={0}
        role={named ? 'region' : undefined}
        aria-label={ariaLabelledBy == null ? ariaLabel : undefined}
        aria-labelledby={regionLabelledBy}
      >
        <Table aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} captionSide="top">
          {caption != null ? <Table.Caption id={captionId}>{caption}</Table.Caption> : null}
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
