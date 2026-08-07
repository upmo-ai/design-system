import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/core';
import clsx from 'clsx';

export type BadgeProps = MantineBadgeProps;

/**
 * The Upmo Badge. A Mantine Badge with sentence-case text (never uppercased),
 * tabular numerals, and the Upmo weight. Defaults to the light variant via the
 * theme. Use `leftSection` for an icon; the colour comes from the `color` prop.
 */
export function Badge<C = 'div'>(props: PolymorphicComponentProps<C, BadgeProps>) {
  const { classNames, tt, color, variant, ...rest } = props as BadgeProps & {
    classNames?: Record<string, string>;
  };
  return (
    <MantineBadge
      // tt="none" wins over Mantine's default uppercase without a specificity
      // fight; the stylesheet reinforces it for consumers who override classNames.
      tt={tt ?? 'none'}
      color={color}
      variant={variant}
      // data-tone lets the stylesheet pick readable text for filled badges on
      // light grounds (emerald, amber, grey) without relying on Mantine's
      // autoContrast, which does not reach our CSS-variable fills.
      data-tone={color ?? 'emerald'}
      {...(rest as BadgeProps)}
      classNames={{ ...classNames, root: clsx('upmo-badge', classNames?.root) }}
    />
  );
}
