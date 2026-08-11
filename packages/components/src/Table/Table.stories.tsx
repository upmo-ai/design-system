import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table.tsx';
import { StatusDot } from '../status/StatusDot.tsx';

const meta: Meta<typeof Table> = {
  title: 'Compositions/Table',
  component: Table,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Table>;

const rows = [
  { id: 'run_4821', agent: 'Invoice sync', status: 'Working' as const, items: 142 },
  { id: 'run_4820', agent: 'Lead triage', status: 'Done' as const, items: 38 },
  { id: 'run_4819', agent: 'Refund review', status: 'Needs approval' as const, items: 7 },
  { id: 'run_4818', agent: 'Report builder', status: 'Failed' as const, items: 0 },
];

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Run</Table.Th>
          <Table.Th>Agent</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Items</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((r) => (
          <Table.Tr key={r.id}>
            <Table.Mono>{r.id}</Table.Mono>
            <Table.Td>{r.agent}</Table.Td>
            <Table.Td>
              <StatusDot status={r.status} label={`${r.agent}: ${r.status}`} />
              <span style={{ marginInlineStart: 8, fontSize: 'var(--text-body-sm-size)' }}>{r.status}</span>
            </Table.Td>
            <Table.Num>{r.items}</Table.Num>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  ),
};
