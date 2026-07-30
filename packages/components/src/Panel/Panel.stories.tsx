import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Text, Title } from '@mantine/core';
import { Panel } from './Panel.tsx';
import { Badge } from '../Badge/Badge.tsx';

const meta: Meta<typeof Panel> = {
  title: 'Compositions/Panel',
  component: Panel,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: () => (
    <Panel maw={420} p="md">
      <Group justify="space-between" mb="xs">
        <Title order={4}>Invoice sync</Title>
        <Badge color="emerald">Active</Badge>
      </Group>
      <Text size="sm" c="dimmed">
        A bordered, flat surface for grouping content. No resting shadow.
      </Text>
    </Panel>
  ),
};
