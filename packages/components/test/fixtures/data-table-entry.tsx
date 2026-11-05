// Browser entry for data-table.browser.test.ts. It is bundled by esbuild and
// loaded into a real Chromium page; it is not imported by jsdom tests.
//
// A captioned DataTable with five columns and `minWidth` 900, so it scrolls
// sideways on a phone. It is the only focusable thing on the page, apart from
// the scrolling region itself.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { createRoot } from 'react-dom/client';
import { DataTable, UpmoProvider, type DataTableColumn } from '../../src/index.ts';

interface Run {
  id: string;
  agent: string;
  model: string;
  started: string;
  items: number;
}

const columns: DataTableColumn<Run>[] = [
  { key: 'id', header: 'Run', render: (r) => r.id, mono: true },
  { key: 'agent', header: 'Agent', render: (r) => r.agent },
  { key: 'model', header: 'Model', render: (r) => r.model },
  { key: 'started', header: 'Started', render: (r) => r.started },
  { key: 'items', header: 'Items', render: (r) => r.items, numeric: true },
];

const rows: Run[] = [
  { id: 'run_4821', agent: 'Invoice sync', model: 'Claude Sonnet', started: '2026-11-04 09:12', items: 142 },
  { id: 'run_4820', agent: 'Lead triage', model: 'Claude Sonnet', started: '2026-11-04 08:47', items: 38 },
  { id: 'run_4819', agent: 'Refund review', model: 'Claude Opus', started: '2026-11-03 17:30', items: 7 },
];

function Page() {
  return (
    <UpmoProvider theme="light" reducedMotion="reduce">
      <div style={{ padding: 16 }}>
        <DataTable<Run>
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          caption="Recent runs"
          minWidth={900}
        />
      </div>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
