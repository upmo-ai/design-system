import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { Switch } from './Switch.tsx';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  args: {
    label: 'Keep agent always on',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <Stack>
      <Switch {...args} />
      <Switch {...args} defaultChecked label="Enabled" />
      <Switch {...args} disabled label="Locked off" />
    </Stack>
  ),
};
