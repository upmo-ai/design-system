import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack } from '@mantine/core';
import { StatusDot } from './StatusDot.tsx';
import { attentions, phases } from './status.ts';

const meta: Meta<typeof StatusDot> = {
  title: 'Status/StatusDot',
  component: StatusDot,
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
type Story = StoryObj<typeof StatusDot>;

export const Playground: Story = {};

export const AllStates: Story = {
  render: () => (
    <Stack>
      <Group>
        {phases.map((p) => (
          <Group key={p} gap={6}>
            <StatusDot status={p} />
            <span style={{ fontSize: 'var(--text-body-sm-size)' }}>{p}</span>
          </Group>
        ))}
      </Group>
      <Group>
        {attentions.map((a) => (
          <Group key={a} gap={6}>
            <StatusDot status={a} />
            <span style={{ fontSize: 'var(--text-body-sm-size)' }}>{a}</span>
          </Group>
        ))}
      </Group>
    </Stack>
  ),
};
