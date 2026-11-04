import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Stack, Text } from '@mantine/core';
import { aliases, brands } from '@upmo-ai/brands';
import { BrandMark } from './BrandMark.tsx';

const meta: Meta<typeof BrandMark> = {
  title: 'Agent surfaces/BrandMark',
  component: BrandMark,
  args: { brand: 'anthropic', size: 36 },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BrandMark>;

export const Playground: Story = {};

export const AllColorful: Story = {
  render: () => (
    <Group gap="lg">
      {brands.map((b) => (
        <Stack key={b.id} align="center" gap={4} w={92}>
          <BrandMark brand={b.id} size={36} />
          <Text size="xs" c="dimmed" ta="center" style={{ wordBreak: 'break-word' }}>
            {b.id}
          </Text>
        </Stack>
      ))}
    </Group>
  ),
};

/** Alternative ids resolve to the same mark as the id they point at. */
export const Aliases: Story = {
  render: () => (
    <Group gap="lg">
      {Object.entries(aliases).map(([alias, id]) => (
        <Stack key={alias} align="center" gap={4} w={110}>
          <BrandMark brand={alias} size={36} />
          <Text size="xs" c="dimmed" ta="center" style={{ wordBreak: 'break-word' }}>
            {alias}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            {id}
          </Text>
        </Stack>
      ))}
    </Group>
  ),
};

export const Monochrome: Story = {
  render: () => (
    <Group gap="lg" c="var(--ink)">
      {['github', 'slack', 'notion', 'linear', 'stripe', 'figma'].map((id) => (
        <BrandMark key={id} brand={id} size={32} monochrome />
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
