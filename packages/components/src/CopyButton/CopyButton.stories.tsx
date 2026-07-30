import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Text } from '@mantine/core';
import { CopyButton } from './CopyButton.tsx';

const meta: Meta<typeof CopyButton> = {
  title: 'Compositions/CopyButton',
  component: CopyButton,
  args: { value: 'upmo-ai-key-9f3b2c' },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Playground: Story = {};

export const WithValue: Story = {
  render: () => (
    <Group gap="xs">
      <Text ff="monospace" size="sm">
        upmo-ai-key-9f3b2c
      </Text>
      <CopyButton value="upmo-ai-key-9f3b2c" />
    </Group>
  ),
};
