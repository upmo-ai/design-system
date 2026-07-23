import { Group, Stack, Table, Text } from '@mantine/core';
import { StatusBadge, StatusDot, attentions, phases } from '@upmo-ai/components';
import { Preview } from './Preview.tsx';

/**
 * The status / liveness surface: both enums as StatusBadges, and StatusDots in a
 * dense table (the kind of busy, live surface the model is designed for).
 */
export function StatusSmoke() {
  const runs: { name: string; status: (typeof phases)[number] | (typeof attentions)[number]; cost: string }[] = [
    { name: 'Invoice sync', status: 'Checking', cost: '$0.21' },
    { name: 'Lead triage', status: 'Working', cost: '$1.04' },
    { name: 'Contract review', status: 'Needs approval', cost: '$0.95' },
    { name: 'Weekly report', status: 'Done', cost: '$0.08' },
    { name: 'Data backfill', status: 'Failed', cost: '$3.17' },
    { name: 'Mailbox sweep', status: 'Paused', cost: '$0.42' },
  ];

  return (
    <Preview label="StatusBadge and StatusDot from @upmo-ai/components. The live caret sweeps for Working and Checking; switch themes and try reduced motion.">
      <Stack gap="lg">
        <div>
          <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
            Phase
          </Text>
          <Group gap="xs">
            {phases.map((p) => (
              <StatusBadge key={p} status={p} />
            ))}
          </Group>
        </div>

        <div>
          <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
            Attention
          </Text>
          <Group gap="xs">
            {attentions.map((a) => (
              <StatusBadge key={a} status={a} />
            ))}
          </Group>
        </div>

        <div>
          <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
            Dense table with status dots
          </Text>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Run</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {runs.map((r) => (
                <Table.Tr key={r.name}>
                  <Table.Td>{r.name}</Table.Td>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <StatusDot status={r.status} label={`${r.name}: ${r.status}`} />
                      <span>{r.status}</span>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.cost}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Stack>
    </Preview>
  );
}
