import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/core';
import clsx from 'clsx';
import classes from './Badge.module.css';

export type BadgeProps = MantineBadgeProps;

/**
 * The Upmo Badge. A Mantine Badge with sentence-case text (never uppercased),
 * tabular numerals, and the Upmo weight. Defaults to the light variant via the
 * theme. Use `leftSection` for an icon; the colour comes from the `color` prop.
 */
export function Badge<C = 'div'>(props: PolymorphicComponentProps<C, BadgeProps>) {
  const { classNames, ...rest } = props as BadgeProps & {
    classNames?: Record<string, string>;
  };
  return (
    <MantineBadge
      {...(rest as BadgeProps)}
      classNames={{
        ...classNames,
        root: clsx(classes.root, classNames?.root),
        label: clsx(classes.label, classNames?.label),
      }}
    />
  );
}
