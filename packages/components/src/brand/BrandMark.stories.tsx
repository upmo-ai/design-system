import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { BrandMark } from './BrandMark.tsx';

const meta: Meta<typeof BrandMark> = {
  title: 'Agent surfaces/BrandMark',
  component: BrandMark,
  args: { brand: 'github', size: 32 },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof BrandMark>;

export const Playground: Story = {};

export const Known: Story = {
  render: () => (
    <Group gap="lg">
      {['github', 'slack', 'stripe', 'notion', 'anthropic', 'openai'].map((b) => (
        <Stack key={b} align="center" gap={4}>
          <BrandMark brand={b} size={32} />
          <Text size="xs" c="dimmed">
            {b}
          </Text>
        </Stack>
      ))}
    </Group>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Group gap="lg">
      <Stack align="center" gap={4}>
        <BrandMark brand="unknown-tool" size={32} kind="connector" />
        <Text size="xs" c="dimmed">
          connector fallback
        </Text>
      </Stack>
      <Stack align="center" gap={4}>
        <BrandMark brand="unknown-model" size={32} kind="provider" />
        <Text size="xs" c="dimmed">
          provider fallback
        </Text>
      </Stack>
    </Group>
  ),
};
