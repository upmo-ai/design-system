import { Card, type CardProps } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/core';

export interface PanelProps extends CardProps {}

/**
 * A Panel is a bordered, flat content surface: the Upmo Card convention
 * (withBorder, no resting shadow, radius-sm by default from the theme). Use it
 * for grouping content. Nested panels can use `radius="md"`; dialogs and
 * overlays carry shadow, panels at rest do not.
 */
export function Panel<C = 'div'>(props: PolymorphicComponentProps<C, PanelProps>) {
  return <Card withBorder {...(props as PanelProps)} />;
}
