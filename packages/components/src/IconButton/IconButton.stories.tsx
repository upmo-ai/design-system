import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { IconDots, IconPlayerPlay, IconRefresh, IconTrash } from '@tabler/icons-react';
import { TooltipGroup } from '../Tooltip/Tooltip.tsx';
import { IconButton } from './IconButton.tsx';

const meta: Meta<typeof IconButton> = {
  title: 'Controls/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Refresh',
    variant: 'subtle',
    children: <IconRefresh size={18} />,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Actions: Story = {
  render: () => (
    <Group>
      <IconButton aria-label="Run">
        <IconPlayerPlay size={18} />
      </IconButton>
      <IconButton aria-label="Refresh">
        <IconRefresh size={18} />
      </IconButton>
      <IconButton aria-label="More actions">
        <IconDots size={18} />
      </IconButton>
      <IconButton aria-label="Delete" color="red">
        <IconTrash size={18} />
      </IconButton>
    </Group>
  ),
};

/** Disabled stays focusable, so the tooltip still explains the control. */
export const Disabled: Story = {
  args: { 'aria-label': 'Refresh (no connection)', disabled: true },
};

/** A toolbar in a TooltipGroup: the first tooltip waits, neighbours open at once. */
export const Toolbar: Story = {
  render: () => (
    <TooltipGroup>
      <Group gap={4}>
        <IconButton aria-label="Run">
          <IconPlayerPlay size={18} />
        </IconButton>
        <IconButton aria-label="Refresh">
          <IconRefresh size={18} />
        </IconButton>
        <IconButton aria-label="More actions">
          <IconDots size={18} />
        </IconButton>
      </Group>
    </TooltipGroup>
  ),
};
