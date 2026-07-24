import { Group, SimpleGrid, Stack, Text } from '@mantine/core';
import {
  Breadcrumbs,
  Button,
  CodeBlock,
  ConfirmDialog,
  CopyButton,
  EmptyState,
  PageHeader,
  Panel,
  Table,
} from '@upmo-ai/components';
import { IconPlug, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Preview } from './Preview.tsx';

/** Compositions: PageHeader, Panel grid, EmptyState, Table, CodeBlock, Breadcrumbs, ConfirmDialog. */
export function CompositionsSmoke() {
  const [confirm, setConfirm] = useState(false);

  return (
    <Preview label="PageHeader, Panel, EmptyState, Table, CodeBlock, Breadcrumbs and ConfirmDialog from @upmo-ai/components.">
      <Stack gap="xl">
        <Breadcrumbs
          items={[{ label: 'Workspace', href: '#' }, { label: 'Connectors', href: '#' }, { label: 'GitHub' }]}
        />

        <PageHeader
          title="Providers"
          description="Connect the model providers your agents use."
          actions={<Button leftSection={<IconPlus size={16} />}>New provider</Button>}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Panel radius="md" padding="md">
            <Text fw={600} size="sm">
              Anthropic
            </Text>
            <Text size="xs" c="dimmed">
              3 models active
            </Text>
          </Panel>
          <Panel radius="md" padding="md">
            <Group justify="space-between">
              <Text size="xs" c="dimmed" ff="monospace">
                sk-ant-xxxxx
              </Text>
              <CopyButton value="sk-ant-xxxxx" />
            </Group>
          </Panel>
        </SimpleGrid>

        <Table.ScrollContainer minWidth={420}>
          <Table aria-label="Runs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Run</Table.Th>
                <Table.Th>Id</Table.Th>
                <Table.Th ta="right">Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td fw={500}>Invoice sync</Table.Td>
                <Table.Mono>run_abc123</Table.Mono>
                <Table.Num>$0.21</Table.Num>
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={500}>Lead triage</Table.Td>
                <Table.Mono>run_def456</Table.Mono>
                <Table.Num>$1.04</Table.Num>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <CodeBlock language="bash" code={'docker compose up -d\nupmo status'} />

        <Panel radius="md" padding="xl" style={{ borderStyle: 'dashed' }}>
          <EmptyState
            icon={<IconPlug size={24} />}
            title="No connectors yet"
            description="Connect a tool to let agents act on your systems."
            action={<Button>Connect a tool</Button>}
          />
        </Panel>

        <Group>
          <Button color="red" variant="light" onClick={() => setConfirm(true)}>
            Remove member
          </Button>
        </Group>

        <ConfirmDialog
          opened={confirm}
          title="Remove member?"
          body="Alex will lose access to this workspace. You can invite them again later."
          action="Remove member"
          destructive
          onClose={() => setConfirm(false)}
          onConfirm={() => setConfirm(false)}
        />
      </Stack>
    </Preview>
  );
}
