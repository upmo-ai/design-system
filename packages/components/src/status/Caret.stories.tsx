import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { Caret } from './Caret.tsx';

const meta: Meta<typeof Caret> = {
  title: 'Status/Caret',
  component: Caret,
  args: {
    mark: 'caret-live',
    size: 48,
  },
  argTypes: {
    mark: {
      control: 'inline-radio',
      options: ['caret-undrawn', 'caret-partial', 'caret-live'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Caret>;

export const Playground: Story = {};

export const DrawRamp: Story = {
  render: () => (
    <Group gap="xl" align="flex-start">
      <Stack align="center" gap={4}>
        <Caret mark="caret-undrawn" size={48} />
        <Text size="xs" c="dimmed">
          Undrawn (Preparing)
        </Text>
      </Stack>
      <Stack align="center" gap={4}>
        <Caret mark="caret-partial" size={48} />
        <Text size="xs" c="dimmed">
          Partial (Planning)
        </Text>
      </Stack>
      <Stack align="center" gap={4}>
        <Caret mark="caret-live" size={48} />
        <Text size="xs" c="dimmed">
          Live, sweeping (Working / Checking)
        </Text>
      </Stack>
    </Group>
  ),
};
