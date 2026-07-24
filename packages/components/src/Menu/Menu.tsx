import { Menu as MantineMenu } from '@mantine/core';

export type { MenuProps } from '@mantine/core';

/**
 * A dropdown menu. Compose with `Menu.Target`, `Menu.Dropdown`, `Menu.Item`,
 * `Menu.Label` and `Menu.Divider`. Destructive items use `color="red"`; item
 * icons go in `leftSection`. Themed by @upmo-ai/theme.
 */
export const Menu = MantineMenu;
