import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { Wordmark } from './Wordmark.tsx';

const meta: Meta<typeof Wordmark> = {
  title: 'Brand/Wordmark',
  component: Wordmark,
  args: { height: 32 },
};

export default meta;
type Story = StoryObj<typeof Wordmark>;

const both: Story['render'] = (args) => (
  <Group gap="xl">
    <Wordmark {...args} />
    <Wordmark {...args} compact />
  </Group>
);

export const Default: Story = { render: both };
export const Compact: Story = { args: { compact: true } };
export const Dark: Story = { render: both, globals: { theme: 'dark' } };
export const HighContrast: Story = { render: both, globals: { theme: 'hc' } };
