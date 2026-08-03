import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { PhaseRail } from './PhaseRail.tsx';

const meta: Meta<typeof PhaseRail> = {
  title: 'Agent surfaces/PhaseRail',
  component: PhaseRail,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof PhaseRail>;

export const States: Story = {
  render: () => (
    <Group align="flex-start" gap={64}>
      <PhaseRail current="Working" />
      <PhaseRail current={null} done />
      <PhaseRail current="Checking" failed />
    </Group>
  ),
};
