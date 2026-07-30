import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '@mantine/core';
import { PageShell } from './PageShell.tsx';
import { Panel } from '../Panel/Panel.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof PageShell> = {
  title: 'Compositions/PageShell',
  component: PageShell,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PageShell>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <PageShell
        header={{
          title: 'Agents',
          description: 'The inner page frame: header plus content.',
          actions: <Button>Deploy agent</Button>,
        }}
      >
        <Panel p="md">
          <Text size="sm" c="dimmed">
            Page content goes here, below the header.
          </Text>
        </Panel>
      </PageShell>
    </div>
  ),
};
