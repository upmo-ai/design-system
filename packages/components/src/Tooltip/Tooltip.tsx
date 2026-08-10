import { Tooltip as MantineTooltip, type TooltipGroupProps } from '@mantine/core';

export type { TooltipProps } from '@mantine/core';
export type { TooltipGroupProps };

/**
 * A tooltip. The theme sets the 400ms open delay, sharp radius, and opens it on
 * keyboard focus as well as hover. Tooltips carry short, supplementary text; an
 * icon-only control's tooltip should match its aria-label (see IconButton).
 */
export const Tooltip = MantineTooltip;

/**
 * Groups neighbouring tooltips (a toolbar, a row of icon buttons) so the first
 * one waits the 400ms tooltip delay and the next opens at once while one is
 * still showing, per the tooltip-delay token. Wrap the controls, not each one.
 */
export function TooltipGroup({ openDelay = 400, closeDelay = 0, children }: TooltipGroupProps) {
  return (
    <MantineTooltip.Group openDelay={openDelay} closeDelay={closeDelay}>
      {children}
    </MantineTooltip.Group>
  );
}
