import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { Checkbox } from './Checkbox.tsx';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Notify me when the task finishes',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const Group: Story = {
  render: () => (
    <Checkbox.Group
      label="Channels"
      description="Several of a few."
      defaultValue={['email']}
    >
      <Stack mt="xs" gap="xs">
        <Checkbox value="email" label="Email" />
        <Checkbox value="slack" label="Slack" />
        <Checkbox value="webhook" label="Webhook" />
      </Stack>
    </Checkbox.Group>
  ),
};
