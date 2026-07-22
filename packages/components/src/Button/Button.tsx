import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/core';
import clsx from 'clsx';

export type ButtonProps = MantineButtonProps;

/**
 * The Upmo Button. A Mantine Button with the crisp Upmo spec: sharp 2px action
 * radius, fixed heights per size, Manrope 600, and the emerald primary (bright
 * in dark, with a hover glow). Variant colours come from the Upmo theme.
 *
 * Mirrors Mantine's Button API: variant ("filled" | "light" | "outline" |
 * "default" | "subtle"), size ("xs" | "sm" | "md" | "lg"), color (e.g. "red" for
 * destructive), and the polymorphic `component` prop.
 */
export function Button<C = 'button'>(props: PolymorphicComponentProps<C, ButtonProps>) {
  const { classNames, ...rest } = props as ButtonProps & {
    classNames?: Record<string, string>;
  };
  return (
    <MantineButton
      {...(rest as ButtonProps)}
      classNames={{ ...classNames, root: clsx('upmo-button', classNames?.root) }}
    />
  );
}
