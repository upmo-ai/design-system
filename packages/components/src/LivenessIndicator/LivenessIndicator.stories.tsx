import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { LivenessIndicator } from './LivenessIndicator.tsx';

const meta: Meta<typeof LivenessIndicator> = {
  title: 'Agent surfaces/LivenessIndicator',
  component: LivenessIndicator,
  args: { count: 3 },
  argTypes: {
    count: { control: { type: 'number', min: 0, max: 99 } },
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof LivenessIndicator>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack>
      <Group gap="xl">
        <Stack align="center" gap={4}>
          <LivenessIndicator count={0} />
          <Text size="xs" c="dimmed">
            Idle (no count)
          </Text>
        </Stack>
        <Stack align="center" gap={4}>
          <LivenessIndicator count={1} />
          <Text size="xs" c="dimmed">
            One run, caret sweeping
          </Text>
        </Stack>
        <Stack align="center" gap={4}>
          <LivenessIndicator count={7} />
          <Text size="xs" c="dimmed">
            Busy
          </Text>
        </Stack>
      </Group>
    </Stack>
  ),
};

export const AsButton: Story = {
  args: { count: 3, onClick: () => {} },
};
