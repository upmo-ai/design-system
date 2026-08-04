import type { Meta, StoryObj } from '@storybook/react-vite';
import { SimpleGrid } from '@mantine/core';
import { StatTile } from './StatTile.tsx';

const meta: Meta<typeof StatTile> = {
  title: 'Usage/StatTile',
  component: StatTile,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof StatTile>;

export const Grid: Story = {
  render: () => (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      <StatTile label="Runs today" value="1,284" trend={{ direction: 'up', label: '+12%' }} hint="vs yesterday" />
      <StatTile label="Spend" value="€42.10" trend={{ direction: 'up', label: '+8%', goodWhenUp: false }} hint="this month" />
      <StatTile label="Failures" value="3" trend={{ direction: 'down', label: '-40%', goodWhenUp: false }} />
      <StatTile label="Active agents" value="7" trend={{ direction: 'flat', label: 'No change' }} />
    </SimpleGrid>
  ),
};
