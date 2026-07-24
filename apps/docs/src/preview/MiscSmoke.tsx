import { Group, Stack, Text } from '@mantine/core';
import { Kbd, KbdGroup, SegmentedControl, Tabs, Tooltip } from '@upmo-ai/components';
import { IconHelp } from '@tabler/icons-react';
import { useState } from 'react';
import { Preview } from './Preview.tsx';

/** Tabs, SegmentedControl, Tooltip and Kbd, rendered live through the theme. */
export function MiscSmoke() {
  const [view, setView] = useState('timeline');

  return (
    <Preview label="Tabs, SegmentedControl, Tooltip and Kbd from @upmo-ai/components. Switch themes to check all three.">
      <Stack gap="xl">
        <Tabs defaultValue="chat">
          <Tabs.List>
            <Tabs.Tab value="chat">Chat</Tabs.Tab>
            <Tabs.Tab value="runs">Runs</Tabs.Tab>
            <Tabs.Tab value="usage">Usage</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="chat" pt="sm">
            <Text size="sm">The chat view.</Text>
          </Tabs.Panel>
          <Tabs.Panel value="runs" pt="sm">
            <Text size="sm">The runs view.</Text>
          </Tabs.Panel>
          <Tabs.Panel value="usage" pt="sm">
            <Text size="sm">The usage view.</Text>
          </Tabs.Panel>
        </Tabs>

        <Group>
          <SegmentedControl
            value={view}
            onChange={setView}
            data={[
              { label: 'Timeline', value: 'timeline' },
              { label: 'List', value: 'list' },
              { label: 'Board', value: 'board' },
            ]}
          />
        </Group>

        <Group gap="xl" align="center">
          <Tooltip label="Agents run on infrastructure you own.">
            <Group gap={6} style={{ cursor: 'help' }}>
              <IconHelp size={16} aria-hidden="true" />
              <Text size="sm">Hover for a tooltip</Text>
            </Group>
          </Tooltip>

          <Group gap={6}>
            <Text size="sm" c="dimmed">
              Open the command palette
            </Text>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Group>
        </Group>
      </Stack>
    </Preview>
  );
}
