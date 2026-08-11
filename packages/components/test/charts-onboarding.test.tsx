import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  BarChart,
  LineChart,
  OnboardingWizard,
  SetupChecklist,
  StatTile,
  Tour,
  UsageMeter,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('StatTile', () => {
  it('renders label, value and trend', () => {
    renderThemed(<StatTile label="Runs" value="1,284" trend={{ direction: 'up', label: '+12%' }} />);
    expect(screen.getByText('Runs')).toBeInTheDocument();
    expect(screen.getByText('1,284')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('treats up as critical when goodWhenUp is false', () => {
    const { container } = renderThemed(
      <StatTile label="Spend" value="€1" trend={{ direction: 'up', label: '+8%', goodWhenUp: false }} />,
    );
    expect(container.querySelector('.upmo-tone-critical')).toBeTruthy();
  });
});

describe('BarChart', () => {
  it('renders a labelled group with each bar', () => {
    const { container } = renderThemed(
      <BarChart title="Runs" data={[{ label: 'Mon', value: 3 }, { label: 'Tue', value: 6 }]} />,
    );
    expect(screen.getByRole('group', { name: 'Runs' })).toBeInTheDocument();
    const plot = container.querySelector('.upmo-barchart__plot') as HTMLElement;
    expect(plot).toHaveAttribute('aria-hidden', 'true');
    expect(within(plot).getByText('Mon')).toBeInTheDocument();
    expect(within(plot).getByText('Tue')).toBeInTheDocument();
  });

  it('exposes its data as a table captioned with the title', () => {
    renderThemed(
      <BarChart
        title="Runs"
        data={[
          { label: 'Mon', value: 3, display: '3 runs' },
          { label: 'Tue', value: 6 },
        ]}
      />,
    );
    const table = screen.getByRole('table', { name: 'Runs' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Mon');
    expect(within(rows[1]).getByRole('cell')).toHaveTextContent('3 runs');
    expect(within(rows[2]).getByRole('cell')).toHaveTextContent('6');
  });
});

describe('LineChart', () => {
  it('renders a labelled group with a polyline', () => {
    const { container } = renderThemed(
      <LineChart title="Spend" data={[{ label: 'a', value: 1 }, { label: 'b', value: 4 }]} />,
    );
    expect(screen.getByRole('group', { name: 'Spend' })).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeTruthy();
  });

  it('keeps the SVG hidden and exposes the points as a table', () => {
    const { container } = renderThemed(
      <LineChart
        title="Spend"
        data={[
          { label: 'Jan', value: 1, display: '€1' },
          { label: 'Feb', value: 4 },
        ]}
      />,
    );
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const table = screen.getByRole('table', { name: 'Spend' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Jan');
    expect(within(rows[1]).getByRole('cell')).toHaveTextContent('€1');
    expect(within(rows[2]).getByRole('cell')).toHaveTextContent('4');
  });
});

describe('UsageMeter', () => {
  it('renders the label and figures', () => {
    renderThemed(<UsageMeter label="Spend" percent={38} used="€38" limit="€100" />);
    expect(screen.getByText('Spend')).toBeInTheDocument();
    expect(screen.getByText('€38')).toBeInTheDocument();
    expect(screen.getByText(/€100/)).toBeInTheDocument();
  });
});

describe('SetupChecklist', () => {
  it('shows progress and fires a step action', () => {
    const onAction = vi.fn();
    renderThemed(
      <SetupChecklist
        steps={[
          { id: '1', title: 'Done step', done: true },
          { id: '2', title: 'Todo step', actionLabel: 'Start', onAction },
        ]}
      />,
    );
    expect(screen.getByText('1 of 2 done')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe('OnboardingWizard', () => {
  it('advances and finishes', () => {
    const onFinish = vi.fn();
    const onActiveChange = vi.fn();
    const { rerender } = renderThemed(
      <OnboardingWizard
        active={0}
        onActiveChange={onActiveChange}
        onFinish={onFinish}
        steps={[{ title: 'One' }, { title: 'Two' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onActiveChange).toHaveBeenCalledWith(1);
    rerender(
      <OnboardingWizard
        active={1}
        onActiveChange={onActiveChange}
        onFinish={onFinish}
        steps={[{ title: 'One' }, { title: 'Two' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe('Tour', () => {
  it('shows the counter and advances; dismiss closes', () => {
    const onClose = vi.fn();
    const onActiveChange = vi.fn();
    renderThemed(
      <Tour
        active={0}
        onActiveChange={onActiveChange}
        onClose={onClose}
        steps={[{ title: 'A', body: 'a' }, { title: 'B', body: 'b' }]}
      />,
    );
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveClass('upmo-button');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onActiveChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss tour' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('is a non-modal dialog named by its title and described by its body', () => {
    renderThemed(
      <Tour active={0} onActiveChange={() => {}} onClose={() => {}} steps={[{ title: 'Approvals', body: 'Agents ask here.' }]} />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Approvals' });
    expect(dialog).toHaveAccessibleDescription('Agents ask here.');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
  });

  it('takes focus on open and on each step, and Escape dismisses', () => {
    const onClose = vi.fn();
    const steps = [{ title: 'A', body: 'a' }, { title: 'B', body: 'b' }];
    const { rerender } = renderThemed(
      <Tour active={0} onActiveChange={() => {}} onClose={onClose} steps={steps} />,
    );
    expect(screen.getByRole('dialog', { name: 'A' })).toHaveFocus();
    screen.getByRole('button', { name: 'Next' }).focus();
    rerender(<Tour active={1} onActiveChange={() => {}} onClose={onClose} steps={steps} />);
    const dialog = screen.getByRole('dialog', { name: 'B' });
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <Tour active={0} onActiveChange={() => {}} onClose={() => {}} steps={[{ title: 'A', body: 'a' }]} />,
        theme,
      );
      unmount();
    }
  });
});
