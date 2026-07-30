import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { StatusBadge } from './StatusBadge.tsx';
import { attentions, phases } from './status.ts';

const meta: Meta<typeof StatusBadge> = {
  title: 'Status/StatusBadge',
  component: StatusBadge,
  args: {
    status: 'Working',
  },
  argTypes: {
    status: {
      control: 'select',
      options: [...phases, ...attentions],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Playground: Story = {};

export const Phases: Story = {
  render: () => (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Phase: the lifecycle a task moves through. Working and Checking draw the live caret.
      </Text>
      <Group>
        {phases.map((p) => (
          <StatusBadge key={p} status={p} />
        ))}
      </Group>
    </Stack>
  ),
};

export const Attention: Story = {
  render: () => (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Attention: what the run wants from the user, or what happened to it.
      </Text>
      <Group>
        {attentions.map((a) => (
          <StatusBadge key={a} status={a} />
        ))}
      </Group>
    </Stack>
  ),
};
