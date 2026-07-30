import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@mantine/core';
import { Tabs } from './Tabs.tsx';

const meta: Meta<typeof Tabs> = {
  title: 'Controls/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="activity" maw={480}>
      <Tabs.List>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
        <Tabs.Tab value="logs">Logs</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="activity" pt="md">
        <Text size="sm">Recent agent activity appears here.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="settings" pt="md">
        <Text size="sm">Agent settings.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="logs" pt="md">
        <Text size="sm">Raw run logs.</Text>
      </Tabs.Panel>
    </Tabs>
  ),
};
