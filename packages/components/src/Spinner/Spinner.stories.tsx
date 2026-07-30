import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { Spinner } from './Spinner.tsx';

const meta: Meta<typeof Spinner> = {
  title: 'Controls/Spinner',
  component: Spinner,
  args: {
    label: 'Loading',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Group align="center">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Group>
  ),
};
