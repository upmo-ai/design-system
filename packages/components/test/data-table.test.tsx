import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type DataTableColumn } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

interface Run {
  id: string;
  agent: string;
}

const columns: DataTableColumn<Run>[] = [
  { key: 'id', header: 'Run', render: (r) => r.id, mono: true },
  { key: 'agent', header: 'Agent', render: (r) => r.agent },
];
const rows: Run[] = [
  { id: 'run_1', agent: 'Invoice sync' },
  { id: 'run_2', agent: 'Lead triage' },
];

function scrollContainer(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[style*="--table-min-width"]')!;
}

describe('DataTable accessible name', () => {
  it('has no name unless one is given', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.getByRole('table')).not.toHaveAccessibleName();
  });

  it('names the table with aria-label', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} aria-label="Recent runs" />);
    expect(screen.getByRole('table', { name: 'Recent runs' })).toBeInTheDocument();
  });

  it('names the table from the element that aria-labelledby points at', () => {
    renderThemed(
      <>
        <h2 id="runs-heading">Run history</h2>
        <DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} aria-labelledby="runs-heading" />
      </>,
    );
    expect(screen.getByRole('table', { name: 'Run history' })).toBeInTheDocument();
  });

  it('names the table from its caption, which stays visible', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />);
    const table = screen.getByRole('table', { name: 'Recent runs' });
    const caption = table.querySelector('caption');
    expect(caption).toHaveTextContent('Recent runs');
    expect(caption).toBeVisible();
  });

  it('puts the name on the table and not on the toolbar search', () => {
    renderThemed(
      <DataTable<Run>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        aria-label="Recent runs"
        search=""
        onSearchChange={() => {}}
        searchPlaceholder="Search runs"
      />,
    );
    expect(screen.getByRole('table')).toHaveAccessibleName('Recent runs');
    expect(screen.getByLabelText('Search runs')).toBeInTheDocument();
  });

  it('keeps the name when there are no rows', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={[]} rowKey={(r) => r.id} caption="Recent runs" />);
    expect(screen.getByRole('table', { name: 'Recent runs' })).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });
});

describe('DataTable caption', () => {
  it('sits above the rows', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />);
    const table = screen.getByRole('table', { name: 'Recent runs' });
    expect(table.style.getPropertyValue('--table-caption-side')).toBe('top');
  });
});

describe('DataTable scroll region', () => {
  function region() {
    return screen.getByRole('region');
  }

  it('is a tab stop that wraps the table, so keyboard users can scroll sideways', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />);
    expect(region()).toHaveAttribute('tabindex', '0');
    expect(region()).toContainElement(screen.getByRole('table'));
  });

  it('takes its name from the caption', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />);
    expect(screen.getByRole('region', { name: 'Recent runs' })).toBeInTheDocument();
  });

  it('takes its name from aria-label', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} aria-label="Recent runs" />);
    expect(screen.getByRole('region', { name: 'Recent runs' })).toBeInTheDocument();
  });

  it('takes its name from the element that aria-labelledby points at', () => {
    renderThemed(
      <>
        <h2 id="runs-heading">Run history</h2>
        <DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} aria-labelledby="runs-heading" />
      </>,
    );
    expect(screen.getByRole('region', { name: 'Run history' })).toBeInTheDocument();
  });

  it('uses the same name as the table when both an aria-label and a caption are set', () => {
    renderThemed(
      <DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} aria-label="Runs" caption="Recent runs" />,
    );
    expect(screen.getByRole('table')).toHaveAccessibleName('Runs');
    expect(screen.getByRole('region')).toHaveAccessibleName('Runs');
  });

  it('stays focusable but is not announced as a region when the table has no name', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('table').closest('[tabindex="0"]')).not.toBeNull();
  });

  it('can be reached with the keyboard', () => {
    renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />);
    region().focus();
    expect(region()).toHaveFocus();
  });
});

describe('DataTable minWidth', () => {
  it('scrolls below 480px by default', () => {
    const { container } = renderThemed(<DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect(scrollContainer(container).style.getPropertyValue('--table-min-width')).toContain('30rem');
  });

  it('uses minWidth for the scroll container', () => {
    const { container } = renderThemed(
      <DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} minWidth={320} />,
    );
    expect(scrollContainer(container).style.getPropertyValue('--table-min-width')).toContain('20rem');
  });
});

describe('DataTable themes', () => {
  it('renders a named table in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <DataTable<Run> columns={columns} rows={rows} rowKey={(r) => r.id} caption="Recent runs" />,
        theme,
      );
      expect(screen.getByRole('table', { name: 'Recent runs' })).toBeInTheDocument();
      unmount();
    }
  });
});
