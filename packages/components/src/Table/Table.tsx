import {
  Table as MantineTable,
  type TableProps as MantineTableProps,
  type TableTdProps,
} from '@mantine/core';
import clsx from 'clsx';

export interface TableProps extends MantineTableProps {}

/**
 * A dense data table with the Upmo conventions baked in: a sticky header on the
 * sunken ground, hairline row rules, hover highlight, and tabular numerals
 * available via the `Num` cell. Compose with the Mantine subcomponents
 * (Thead/Tbody/Tr/Th/Td) plus the `Table.Num` and `Table.Mono` cell helpers.
 *
 * Wrap in `Table.ScrollContainer` for horizontal overflow on narrow screens.
 */
function TableRoot({ classNames, stickyHeader, highlightOnHover, verticalSpacing, ...rest }: TableProps) {
  return (
    <MantineTable
      stickyHeader={stickyHeader ?? true}
      highlightOnHover={highlightOnHover ?? true}
      verticalSpacing={verticalSpacing ?? 'sm'}
      classNames={{ ...classNames, table: clsx('upmo-table', (classNames as Record<string, string>)?.table) }}
      {...rest}
    />
  );
}

/** A right-aligned cell with tabular numerals, for amounts and counts. */
function Num({ className, ...rest }: TableTdProps) {
  return <MantineTable.Td className={clsx('upmo-table__num', className)} {...rest} />;
}

/** A monospace cell, for ids, hashes and keys. */
function Mono({ className, ...rest }: TableTdProps) {
  return <MantineTable.Td className={clsx('upmo-table__mono', className)} {...rest} />;
}

export const Table = Object.assign(TableRoot, {
  Thead: MantineTable.Thead,
  Tbody: MantineTable.Tbody,
  Tfoot: MantineTable.Tfoot,
  Tr: MantineTable.Tr,
  Th: MantineTable.Th,
  Td: MantineTable.Td,
  Caption: MantineTable.Caption,
  ScrollContainer: MantineTable.ScrollContainer,
  Num,
  Mono,
});
