import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { Input } from './Input.tsx';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  args: {
    label: 'Workspace name',
    placeholder: 'e.g. Acme production',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <Stack maw={360}>
      <Input {...args} />
      <Input {...args} description="Shown to everyone in the workspace." />
      <Input {...args} error="This name is already taken." defaultValue="Acme production" />
      <Input {...args} disabled defaultValue="Locked value" />
    </Stack>
  ),
};
