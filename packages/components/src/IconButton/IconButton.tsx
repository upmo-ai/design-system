import { ActionIcon, type ActionIconProps, Tooltip, type TooltipProps } from '@mantine/core';
import clsx from 'clsx';
import type { MouseEventHandler, ReactNode } from 'react';
import classes from './IconButton.module.css';

export interface IconButtonProps extends ActionIconProps {
  /** The icon to render. Decorative; the accessible name is the aria-label. */
  children: ReactNode;
  /**
   * The accessible name. Required: an icon-only control must carry a label.
   * By default it doubles as the tooltip text (the Upmo rule), matching the
   * product's RowAction pattern.
   */
  'aria-label': string;
  /** Tooltip text; defaults to the aria-label. Pass null to suppress the tooltip. */
  tooltip?: ReactNode | null;
  /** Tooltip placement; forwarded to Mantine Tooltip. */
  tooltipPosition?: TooltipProps['position'];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * An icon-only button. Wraps Mantine ActionIcon and requires an `aria-label`,
 * which by default also becomes the tooltip, so every icon control is both
 * accessible and self-describing. Sharp action radius, press feedback.
 */
export function IconButton({
  children,
  tooltip,
  tooltipPosition = 'bottom',
  classNames,
  ...rest
}: IconButtonProps) {
  const label = rest['aria-label'];
  const tip = tooltip === undefined ? label : tooltip;

  const control = (
    <ActionIcon
      {...rest}
      classNames={{ ...classNames, root: clsx(classes.root, (classNames as Record<string, string>)?.root) }}
    >
      {children}
    </ActionIcon>
  );

  if (tip === null) return control;
  return (
    <Tooltip label={tip} position={tooltipPosition} openDelay={400}>
      {control}
    </Tooltip>
  );
}
