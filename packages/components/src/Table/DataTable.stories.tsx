import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { SegmentedControl } from '@mantine/core';
import { DataTable, type DataTableColumn } from './DataTable.tsx';
import { StatusDot } from '../status/StatusDot.tsx';
import type { Status } from '../status/status.ts';

const meta: Meta<typeof DataTable> = {
  title: 'Compositions/DataTable',
  component: DataTable as never,
  parameters: { layout: 'padded' },
};

export default meta;

interface Run {
  id: string;
  agent: string;
  status: Status;
  items: number;
}

const allRows: Run[] = [
  { id: 'run_4821', agent: 'Invoice sync', status: 'Working', items: 142 },
  { id: 'run_4820', agent: 'Lead triage', status: 'Done', items: 38 },
  { id: 'run_4819', agent: 'Refund review', status: 'Needs approval', items: 7 },
  { id: 'run_4818', agent: 'Report builder', status: 'Failed', items: 0 },
  { id: 'run_4817', agent: 'Invoice sync', status: 'Done', items: 120 },
  { id: 'run_4816', agent: 'Lead triage', status: 'Done', items: 44 },
  { id: 'run_4815', agent: 'Digest', status: 'Checking', items: 5 },
  { id: 'run_4814', agent: 'Report builder', status: 'Done', items: 61 },
  { id: 'run_4813', agent: 'Refund review', status: 'Done', items: 12 },
  { id: 'run_4812', agent: 'Digest', status: 'Done', items: 5 },
];

const columns: DataTableColumn<Run>[] = [
  { key: 'id', header: 'Run', render: (r) => r.id, mono: true },
  { key: 'agent', header: 'Agent', render: (r) => r.agent },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status={r.status} label={`${r.agent}: ${r.status}`} />
        <span style={{ fontSize: 13 }}>{r.status}</span>
      </span>
    ),
  },
  { key: 'items', header: 'Items', render: (r) => r.items, numeric: true },
];

export const WithToolbarAndPagination: StoryObj = {
  render: () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const pageSize = 4;

    const filtered = useMemo(() => {
      let rows = allRows;
      if (filter === 'Live') rows = rows.filter((r) => r.status === 'Working' || r.status === 'Checking');
      else if (filter === 'Done') rows = rows.filter((r) => r.status === 'Done');
      if (search.trim()) {
        const q = search.toLowerCase();
        rows = rows.filter((r) => r.agent.toLowerCase().includes(q) || r.id.includes(q));
      }
      return rows;
    }, [search, filter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
      <DataTable<Run>
        columns={columns}
        rows={pageRows}
        rowKey={(r) => r.id}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search runs"
        filters={
          <SegmentedControl
            size="xs"
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setPage(1);
            }}
            data={['All', 'Live', 'Done']}
          />
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        summary={`${filtered.length} runs`}
      />
    );
  },
};
