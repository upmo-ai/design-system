import { Select as MantineSelect, type SelectProps as MantineSelectProps } from '@mantine/core';
import clsx from 'clsx';

export interface SelectProps extends MantineSelectProps {
  /**
   * Make the Select searchable. The forms spec recommends search above ~10
   * options; pass `searchable` (or let the Select auto-enable it when data is
   * long, if the caller opts in).
   */
  searchable?: boolean;
}

/**
 * A single-choice select. Mantine Select with the Upmo control feel and the
 * check on the right (matching the product). `data` is `{ value, label }[]`;
 * `onChange` yields `string | null`.
 */
export function Select({ classNames, checkIconPosition, ...rest }: SelectProps) {
  return (
    <MantineSelect
      checkIconPosition={checkIconPosition ?? 'right'}
      {...rest}
      classNames={{ ...classNames, input: clsx('upmo-input', (classNames as Record<string, string>)?.input) }}
    />
  );
}
