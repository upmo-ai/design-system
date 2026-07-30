import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { Radio } from './Radio.tsx';

const meta: Meta<typeof Radio> = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
  render: () => (
    <Radio.Group
      label="Autonomy"
      description="One of a few."
      defaultValue="ask"
    >
      <Stack mt="xs" gap="xs">
        <Radio value="ask" label="Ask before each action" />
        <Radio value="auto" label="Run automatically" description="Only pause for approvals." />
        <Radio value="off" label="Paused" />
      </Stack>
    </Radio.Group>
  ),
};
