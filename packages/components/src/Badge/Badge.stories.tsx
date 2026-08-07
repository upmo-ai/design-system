import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { Badge } from './Badge.tsx';

const meta: Meta<typeof Badge> = {
  title: 'Controls/Badge',
  component: Badge,
  args: {
    children: '3 running',
    color: 'emerald',
    variant: 'light',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Colors: Story = {
  args: { variant: 'filled' },
  render: (args) => (
    <Group>
      <Badge {...args} color="emerald">
        Active
      </Badge>
      <Badge {...args} color="blue">
        Info
      </Badge>
      <Badge {...args} color="yellow">
        Attention
      </Badge>
      <Badge {...args} color="red">
        Failed
      </Badge>
      <Badge {...args} color="gray">
        Idle
      </Badge>
    </Group>
  ),
};

export const SoftColors: Story = {
  args: { variant: 'light' },
  render: (args) => (
    <Group>
      <Badge {...args} color="emerald">
        Active
      </Badge>
      <Badge {...args} color="blue">
        Info
      </Badge>
      <Badge {...args} color="yellow">
        Attention
      </Badge>
      <Badge {...args} color="red">
        Failed
      </Badge>
      <Badge {...args} color="gray">
        Idle
      </Badge>
    </Group>
  ),
};

export const SentenceCase: Story = {
  args: { children: 'Needs approval' },
};
