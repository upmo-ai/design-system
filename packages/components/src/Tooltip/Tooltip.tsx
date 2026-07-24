import { Tooltip as MantineTooltip } from '@mantine/core';

export type { TooltipProps } from '@mantine/core';

/**
 * A tooltip. The theme sets the 400ms open delay and sharp radius. Tooltips
 * carry short, supplementary text; an icon-only control's tooltip should match
 * its aria-label (see IconButton).
 */
export const Tooltip = MantineTooltip;
