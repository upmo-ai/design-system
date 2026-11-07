import { act, fireEvent, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  ComboChart,
  DonutChart,
  GroupedBarChart,
  LineChart,
  type LineSeries,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

const days = ['Mon', 'Tue', 'Wed', 'Thu'];

function line(name: string, values: (number | null)[], extra: Partial<LineSeries> = {}): LineSeries {
  return { name, points: values.map((value, i) => ({ label: days[i] ?? `D${i + 1}`, value })), ...extra };
}

/** The y axis tick labels (not the x labels) of the main drawing. */
const yTicks = (container: HTMLElement) =>
  [...container.querySelectorAll('svg.upmo-chart__svg .upmo-chart__tick:not(.upmo-chart__tick--x)')].map(
    (t) => t.textContent,
  );
const xLabels = (container: HTMLElement) =>
  [...container.querySelectorAll('svg.upmo-chart__svg .upmo-chart__tick--x')].map((t) => t.textContent);
const readoutText = (container: HTMLElement) => container.querySelector('.upmo-chart__readout')?.textContent;
const focusChart = (name: string) => {
  const figure = screen.getByRole('group', { name });
  act(() => figure.focus());
  return figure;
};

describe('LineChart series', () => {
  const series = [line('Input', [10, 20, 30, 40]), line('Output', [5, 6, 7, 8])];

  it('renders a labelled, focusable group with a hidden drawing', () => {
    const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
    const group = screen.getByRole('group', { name: 'Tokens' });
    expect(group).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.upmo-linechart__run')).toHaveLength(2);
  });

  it('exposes every point in a hidden table captioned with the title', () => {
    renderThemed(
      <LineChart
        title="Tokens"
        series={[
          line('Input', [10, 20, 30, 40]),
          { name: 'Output', points: days.map((label, i) => ({ label, value: i, display: `${i} tok` })) },
        ]}
      />,
    );
    const table = screen.getByRole('table', { name: 'Tokens' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Label', 'Input', 'Output']);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Mon');
    expect(within(rows[2]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['20', '1 tok']);
  });

  it('shows a legend table with a swatch, name, mean and max, using formatValue', () => {
    renderThemed(
      <LineChart title="Tokens" series={series} formatValue={(n) => `${n} tok`} />,
    );
    const legend = screen.getByRole('table', { name: 'Tokens series' });
    const rows = within(legend).getAllByRole('row');
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Series', 'Mean', 'Max']);
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Input');
    expect(rows[1].querySelector('svg.upmo-chart__swatch')).toBeTruthy();
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['25 tok', '40 tok']);
    expect(within(rows[2]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['6.5 tok', '8 tok']);
  });

  it('can hide the legend', () => {
    renderThemed(<LineChart title="Tokens" series={series} legend={false} />);
    expect(screen.queryByRole('table', { name: 'Tokens series' })).toBeNull();
  });

  it('draws a null as a gap in the line, never as zero', () => {
    const { container } = renderThemed(
      <LineChart
        title="Spend"
        series={[
          {
            name: 'Spend',
            points: ['a', 'b', 'c', 'd', 'e'].map((label, i) => ({ label, value: [1, 2, null, 4, 5][i] })),
          },
        ]}
      />,
    );
    // Two runs, and no marker at the missing point.
    expect(container.querySelectorAll('.upmo-linechart__run')).toHaveLength(2);
    const plot = container.querySelector('svg.upmo-chart__svg') as SVGElement;
    expect(plot.querySelectorAll('.upmo-chart__marker[data-marker]')).toHaveLength(4);
    const table = screen.getByRole('table', { name: 'Spend' });
    expect(within(within(table).getAllByRole('row')[3]).getByRole('cell')).toHaveTextContent('No data');
    // The mean is over the four real values (3), not five with a zero (2.4).
    const legend = screen.getByRole('table', { name: 'Spend series' });
    expect(within(legend).getAllByRole('cell')[0]).toHaveTextContent('3');
  });

  it('draws an axis with four or five nice ticks and formats them', () => {
    const { container } = renderThemed(
      <LineChart title="Spend" series={[line('Spend', [0, 400, 900, 1284])]} formatValue={(n) => `€${n}`} />,
    );
    const ticks = yTicks(container);
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    expect(ticks.length).toBeLessThanOrEqual(5);
    expect(ticks).toEqual(['€0', '€500', '€1000', '€1500']);
  });

  it('shows a readout on keyboard focus and moves with the arrow keys', () => {
    const { container } = renderThemed(
      <LineChart title="Tokens" series={[line('Input', [10, 20, 30, 40]), line('Output', [5, null, 7, 8])]} />,
    );
    expect(readoutText(container)).toBe('');
    const figure = focusChart('Tokens');
    expect(readoutText(container)).toBe('Mon: Input 10, Output 5');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Tue: Input 20, Output no data');
    fireEvent.keyDown(figure, { key: 'End' });
    expect(readoutText(container)).toBe('Thu: Input 40, Output 8');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Thu: Input 40, Output 8');
    fireEvent.keyDown(figure, { key: 'Home' });
    expect(readoutText(container)).toBe('Mon: Input 10, Output 5');
    expect(container.querySelector('.upmo-chart__readout')).toHaveAttribute('aria-live', 'polite');
    fireEvent.keyDown(figure, { key: 'Escape' });
    expect(readoutText(container)).toBe('');
  });

  it('shows the same readout on hover and clears it on leave', () => {
    const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
    const hits = container.querySelectorAll('.upmo-chart__hit');
    expect(hits).toHaveLength(4);
    fireEvent.mouseEnter(hits[2]);
    expect(readoutText(container)).toBe('Wed: Input 30, Output 7');
    fireEvent.mouseLeave(container.querySelector('svg.upmo-chart__svg') as SVGElement);
    expect(readoutText(container)).toBe('');
  });

  it('prefers a point display over formatValue in the readout', () => {
    const { container } = renderThemed(
      <LineChart
        title="Spend"
        series={[{ name: 'Spend', points: [{ label: 'Jan', value: 1, display: 'one euro' }] }]}
        formatValue={(n) => `${n}!`}
      />,
    );
    focusChart('Spend');
    expect(readoutText(container)).toBe('Jan: Spend one euro');
  });

  it('shows an empty state for no series, and for series with no points', () => {
    const none = renderThemed(<LineChart title="Tokens" series={[]} />);
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(none.container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('group', { name: 'Tokens' })).not.toHaveAttribute('tabindex');
    none.unmount();

    const noPoints = renderThemed(<LineChart title="Tokens" series={[{ name: 'A', points: [] }]} emptyText="Nothing yet" />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(noPoints.container.querySelector('svg')).toBeNull();
  });

  it('separates series by marker shape and dash, not colour alone', () => {
    const five = Array.from({ length: 5 }, (_, i) => line(`S${i + 1}`, [i + 1, i + 2, i + 3, i + 4]));
    const { container } = renderThemed(<LineChart title="Five" series={five} />);
    const runs = [...container.querySelectorAll('.upmo-linechart__run')];
    expect(runs.map((r) => r.getAttribute('stroke-dasharray'))).toEqual([null, null, null, null, '6 4']);
    const legendMarks = [...screen.getByRole('table', { name: 'Five series' }).querySelectorAll('[data-marker]')].map(
      (m) => m.getAttribute('data-marker'),
    );
    expect(legendMarks).toEqual(['circle', 'square', 'triangle', 'diamond', 'circle']);
    const plotMarks = new Set(
      [...container.querySelectorAll('svg.upmo-chart__svg [data-marker]')].map((m) => m.getAttribute('data-marker')),
    );
    expect(plotMarks).toEqual(new Set(['circle', 'square', 'triangle', 'diamond']));
  });

  it('keeps the five highest series and merges the rest into Other in chart-mid', () => {
    const eight = [10, 80, 30, 70, 20, 60, 50, 40].map((v, i) => line(`S${i + 1}`, [v, v, v, v]));
    const { container } = renderThemed(<LineChart title="Eight" series={eight} />);
    const legend = screen.getByRole('table', { name: 'Eight series' });
    const rows = within(legend).getAllByRole('row').slice(1);
    expect(rows.map((r) => within(r).getByRole('rowheader').textContent)).toEqual(['S2', 'S4', 'S6', 'S7', 'S8', 'Other']);
    expect(within(rows[5]).getAllByRole('cell')[0]).toHaveTextContent('60');
    expect(rows[5].querySelector('line')?.getAttribute('style')).toContain('--chart-mid');
    expect(rows[0].querySelector('line')?.getAttribute('style')).toContain('--chart-1)');
    expect(container.querySelectorAll('.upmo-linechart__run')).toHaveLength(6);
    // The hidden table still carries every original series.
    const table = screen.getByRole('table', { name: 'Eight' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(9);
  });

  it('uses the otherLabel for the merged series', () => {
    const seven = Array.from({ length: 7 }, (_, i) => line(`S${i + 1}`, [i, i, i, i]));
    renderThemed(<LineChart title="Seven" series={seven} otherLabel="Rest" />);
    expect(within(screen.getByRole('table', { name: 'Seven series' })).getByText('Rest')).toBeInTheDocument();
  });

  it('draws six series without merging', () => {
    const six = Array.from({ length: 6 }, (_, i) => line(`S${i + 1}`, [i, i, i, i]));
    renderThemed(<LineChart title="Six" series={six} />);
    expect(within(screen.getByRole('table', { name: 'Six series' })).queryByText('Other')).toBeNull();
  });

  it('stacks the areas and sizes the axis to the total', () => {
    const { container } = renderThemed(
      <LineChart
        title="Tokens"
        stacked
        series={[line('Input', [10, 20, 30, 40]), line('Output', [5, 6, 7, 8]), line('Tool defs', [1, 1, 1, 1])]}
      />,
    );
    expect(container.querySelectorAll('.upmo-linechart__area')).toHaveLength(3);
    // The largest total is 49, so the axis must reach past the biggest single series (40).
    const ticks = yTicks(container).map(Number);
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(49);
  });

  it('washes under each line only when asked, for several series', () => {
    const off = renderThemed(<LineChart title="A" series={series} />);
    expect(off.container.querySelectorAll('.upmo-linechart__area')).toHaveLength(0);
    off.unmount();
    const on = renderThemed(<LineChart title="A" series={series} area />);
    expect(on.container.querySelectorAll('.upmo-linechart__area')).toHaveLength(2);
    on.unmount();
    const single = renderThemed(<LineChart title="A" series={[series[0]]} />);
    expect(single.container.querySelectorAll('.upmo-linechart__area')).toHaveLength(1);
  });

  it('draws a smooth curve when asked', () => {
    const linear = renderThemed(<LineChart title="A" series={series} />);
    expect(linear.container.querySelector('.upmo-linechart__run')?.getAttribute('d')).not.toContain('C');
    linear.unmount();
    const smooth = renderThemed(<LineChart title="A" series={series} curve="smooth" />);
    expect(smooth.container.querySelector('.upmo-linechart__run')?.getAttribute('d')).toContain('C');
  });

  it('thins the x labels when they would overlap', () => {
    const many = Array.from({ length: 24 }, (_, i) => ({ label: `Day ${i + 1}`, value: i }));
    const { container } = renderThemed(<LineChart title="Many" width={240} series={[{ name: 'A', points: many }]} />);
    const labels = xLabels(container);
    expect(labels.length).toBeGreaterThan(1);
    expect(labels.length).toBeLessThan(24);
    expect(labels[0]).toBe('Day 1');
  });

  it('keeps the single-series data markup unchanged', () => {
    const { container } = renderThemed(
      <LineChart title="Spend" data={[{ label: 'a', value: 1 }, { label: 'b', value: 4 }]} />,
    );
    const figure = container.querySelector('figure') as HTMLElement;
    expect(figure.className).toBe('upmo-linechart');
    expect(figure).not.toHaveAttribute('tabindex');
    expect(container.querySelector('polyline')).toBeTruthy();
    expect(container.querySelector('.upmo-chart__legend')).toBeNull();
    expect(container.querySelector('.upmo-chart__readout')).toBeNull();
  });
});

describe('DonutChart', () => {
  const data = [
    { label: 'Claude', value: 60, display: '60 runs' },
    { label: 'Nova', value: 30 },
    { label: 'Llama', value: 10 },
  ];

  it('renders a labelled group with centre label and value', () => {
    const { container } = renderThemed(
      <DonutChart title="Runs by model" data={data} centerLabel="Runs" centerValue="100" />,
    );
    expect(screen.getByRole('group', { name: 'Runs by model' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const centre = container.querySelector('.upmo-donut__center') as HTMLElement;
    expect(centre).toHaveTextContent('Runs');
    expect(centre).toHaveTextContent('100');
    expect(container.querySelectorAll('.upmo-donut__slice')).toHaveLength(3);
  });

  it('defaults the centre to the formatted total', () => {
    const { container } = renderThemed(<DonutChart title="Runs" data={data} formatValue={(n) => `${n} r`} />);
    const centre = container.querySelector('.upmo-donut__center') as HTMLElement;
    expect(centre).toHaveTextContent('Total');
    expect(centre).toHaveTextContent('100 r');
  });

  it('lists each slice with its label, display and percent', () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    const rows = [...container.querySelectorAll('.upmo-donut__row')];
    expect(rows.map((r) => r.textContent)).toEqual(['Claude60 runs60%', 'Nova3030%', 'Llama1010%']);
    expect(rows[0].querySelector('svg.upmo-chart__swatch')).toBeTruthy();
  });

  it('exposes every slice in a hidden table', () => {
    renderThemed(<DonutChart title="Runs by model" data={data} />);
    const table = screen.getByRole('table', { name: 'Runs by model' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Claude');
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['60 runs', '60%']);
  });

  it('merges slices beyond the fifth into Other in chart-mid', () => {
    const seven = Array.from({ length: 7 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
    const { container } = renderThemed(<DonutChart title="Models" data={seven} />);
    const rows = [...container.querySelectorAll('.upmo-donut__row')];
    expect(rows).toHaveLength(6);
    expect(rows[5].textContent).toBe('Other2029%');
    expect(rows[5].querySelector('rect')?.getAttribute('style')).toContain('--chart-mid');
    expect(container.querySelectorAll('.upmo-donut__slice')).toHaveLength(6);
    // The hidden table keeps all seven.
    expect(within(screen.getByRole('table', { name: 'Models' })).getAllByRole('row')).toHaveLength(8);
  });

  it('does not merge five slices or fewer', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
    const { container } = renderThemed(<DonutChart title="Models" data={five} />);
    expect(container.querySelectorAll('.upmo-donut__row')).toHaveLength(5);
    expect(screen.queryByText('Other')).toBeNull();
  });

  it('textures each slice so colour is not the only cue', () => {
    const { container } = renderThemed(<DonutChart title="Models" data={data} />);
    const fills = [...container.querySelectorAll('.upmo-donut__slice')].map((s) => s.getAttribute('style'));
    expect(fills[0]).toContain('--chart-1');
    expect(fills[1]).toContain('url(#');
    expect(fills[2]).toContain('url(#');
    expect(fills[1]).not.toEqual(fills[2]);
  });

  it('draws an empty ring with the empty text for a zero total', () => {
    const { container } = renderThemed(
      <DonutChart title="Runs" data={[{ label: 'A', value: 0 }, { label: 'B', value: 0 }]} />,
    );
    expect(container.querySelector('.upmo-donut__empty-ring')).toBeTruthy();
    expect(container.querySelectorAll('.upmo-donut__slice')).toHaveLength(0);
    expect(screen.getByText('No data to show')).toBeInTheDocument();
  });

  it('draws an empty ring when there are no slices', () => {
    const { container } = renderThemed(<DonutChart title="Runs" data={[]} emptyText="No runs yet" />);
    expect(container.querySelector('.upmo-donut__empty-ring')).toBeTruthy();
    expect(screen.getByText('No runs yet')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Runs' })).not.toHaveAttribute('tabindex');
  });

  it('counts a negative or missing value as zero', () => {
    const { container } = renderThemed(
      <DonutChart title="Runs" data={[{ label: 'A', value: -5 }, { label: 'B', value: 10 }]} />,
    );
    expect(container.querySelectorAll('.upmo-donut__slice')).toHaveLength(1);
    expect(container.querySelector('.upmo-donut__row')?.textContent).toBe('A00%');
  });

  it('shows the slice in a readout on focus, arrow keys and hover', () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    const figure = focusChart('Runs by model');
    expect(readoutText(container)).toBe('Claude: 60 runs (60%)');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Nova: 30 (30%)');
    fireEvent.mouseEnter(container.querySelectorAll('.upmo-donut__slice')[2]);
    expect(readoutText(container)).toBe('Llama: 10 (10%)');
    fireEvent.mouseEnter(container.querySelectorAll('.upmo-donut__row')[0]);
    expect(readoutText(container)).toBe('Claude: 60 runs (60%)');
  });
});

describe('DonutChart percentages', () => {
  const legendPercents = (container: HTMLElement) =>
    [...container.querySelectorAll('.upmo-donut__pct')].map((p) => Number.parseFloat(p.textContent ?? ''));
  const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 10) / 10;

  it('adds up to exactly 100 for three equal slices', () => {
    const { container } = renderThemed(
      <DonutChart title="Thirds" data={['A', 'B', 'C'].map((label) => ({ label, value: 1 }))} />,
    );
    expect(sum(legendPercents(container))).toBe(100);
    expect([...container.querySelectorAll('.upmo-donut__pct')].map((p) => p.textContent)).toEqual([
      '34%',
      '33%',
      '33%',
    ]);
  });

  it('adds up to exactly 100 when rounding would overshoot', () => {
    const data = [25.5, 25.5, 25.5, 23.5].map((value, i) => ({ label: `S${i}`, value }));
    const { container } = renderThemed(<DonutChart title="Over" data={data} />);
    expect(sum(legendPercents(container))).toBe(100);
  });

  it('adds up to exactly 100 after the Other merge, in the legend and the table', () => {
    const seven = Array.from({ length: 7 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
    const { container } = renderThemed(<DonutChart title="Models" data={seven} />);
    expect(sum(legendPercents(container))).toBe(100);
    const rows = within(screen.getByRole('table', { name: 'Models' })).getAllByRole('row').slice(1);
    const shares = rows.map((r) => Number.parseFloat(within(r).getAllByRole('cell')[1].textContent ?? ''));
    expect(sum(shares)).toBe(100);
  });

  it('adds up to exactly 100 with small and large shares mixed', () => {
    const data = [61, 20, 12, 4.3, 2.4, 0.3].map((value, i) => ({ label: `S${i}`, value }));
    const { container } = renderThemed(<DonutChart title="Mixed" data={data} />);
    expect(sum(legendPercents(container))).toBe(100);
  });

  it('uses the rounded share in the readout', () => {
    const { container } = renderThemed(
      <DonutChart title="Thirds" data={['A', 'B', 'C'].map((label) => ({ label, value: 1 }))} />,
    );
    focusChart('Thirds');
    expect(readoutText(container)).toBe('A: 1 (34%)');
  });
});

describe('GroupedBarChart', () => {
  const groups = [
    { label: 'Mon', bars: [{ name: 'Passed', value: 30 }, { name: 'Failed', value: 4 }] },
    { label: 'Tue', bars: [{ name: 'Passed', value: 42 }, { name: 'Failed', value: null }] },
    { label: 'Wed', bars: [{ name: 'Passed', value: 25, display: '25 runs' }, { name: 'Failed', value: 0 }] },
  ];

  it('renders a labelled group, a hidden drawing and a legend of the bar names', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    expect(screen.getByRole('group', { name: 'Runs' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect([...container.querySelectorAll('.upmo-chart__legend-item')].map((i) => i.textContent)).toEqual([
      'Passed',
      'Failed',
    ]);
    expect(container.querySelector('.upmo-grouped-bar--vertical')).toBeTruthy();
  });

  it('skips a null bar and never draws it as zero', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    // 6 bars minus the one null.
    expect(container.querySelectorAll('.upmo-grouped-bar__bar')).toHaveLength(5);
    const table = screen.getByRole('table', { name: 'Runs' });
    expect(within(within(table).getAllByRole('row')[2]).getAllByRole('cell')[1]).toHaveTextContent('No data');
  });

  it('exposes every value in a hidden table', () => {
    renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    const table = screen.getByRole('table', { name: 'Runs' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Label', 'Passed', 'Failed']);
    expect(within(rows[3]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['25 runs', '0']);
  });

  it('uses chart-1 to chart-3 by bar index with a different texture for each', () => {
    const three = groups.map((g) => ({ ...g, bars: [...g.bars, { name: 'Skipped', value: 2 }] }));
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={three} />);
    const first = [...container.querySelectorAll('.upmo-grouped-bar__bar')].slice(0, 3);
    expect(first[0].getAttribute('style')).toContain('--chart-1');
    expect(first[1].getAttribute('style')).toContain('url(#');
    expect(first[2].getAttribute('style')).toContain('url(#');
    expect(first[1].getAttribute('style')).not.toEqual(first[2].getAttribute('style'));
    const legend = container.querySelectorAll('.upmo-chart__legend-item');
    expect(legend[0].querySelector('rect')?.getAttribute('style')).toContain('--chart-1');
  });

  it('merges bars beyond the third into Other in chart-mid', () => {
    const five = ['A', 'B', 'C', 'D', 'E'];
    const wide = [
      { label: 'Mon', bars: five.map((name, i) => ({ name, value: i + 1 })) },
      { label: 'Tue', bars: five.map((name, i) => ({ name, value: i + 1 })) },
    ];
    const { container } = renderThemed(<GroupedBarChart title="Wide" groups={wide} />);
    expect([...container.querySelectorAll('.upmo-chart__legend-item')].map((i) => i.textContent)).toEqual([
      'A',
      'B',
      'C',
      'Other',
    ]);
    expect(container.querySelectorAll('.upmo-grouped-bar__bar')).toHaveLength(8);
    focusChart('Wide');
    expect(readoutText(container)).toBe('Mon: A 1, B 2, C 3, Other 9');
    expect(container.querySelectorAll('.upmo-chart__legend-item')[3].querySelector('rect')?.getAttribute('style')).toContain(
      '--chart-mid',
    );
    expect(within(screen.getByRole('table', { name: 'Wide' })).getAllByRole('columnheader')).toHaveLength(6);
  });

  it('draws horizontal bars when asked', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} orientation="horizontal" />);
    expect(container.querySelector('.upmo-grouped-bar--horizontal')).toBeTruthy();
    const bars = container.querySelectorAll('.upmo-grouped-bar__bar');
    expect(bars).toHaveLength(5);
    // Horizontal bars share a height and differ in width.
    expect(new Set([...bars].map((b) => b.getAttribute('height'))).size).toBe(1);
    expect(new Set([...bars].map((b) => b.getAttribute('width'))).size).toBeGreaterThan(1);
  });

  it('draws an axis with four or five ticks and formats them', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} formatValue={(n) => `${n}r`} />);
    const ticks = yTicks(container);
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    expect(ticks.length).toBeLessThanOrEqual(5);
    expect(ticks.every((t) => t?.endsWith('r'))).toBe(true);
    const horizontal = renderThemed(<GroupedBarChart title="H" groups={groups} orientation="horizontal" formatValue={(n) => `${n}r`} />);
    const hTicks = xLabels(horizontal.container).filter((t) => t?.endsWith('r'));
    expect(hTicks.length).toBeGreaterThanOrEqual(4);
    expect(hTicks.length).toBeLessThanOrEqual(5);
  });

  it('labels every gridline of a horizontal chart, even in a narrow one', () => {
    const { container } = renderThemed(
      <GroupedBarChart
        title="Narrow"
        groups={groups}
        orientation="horizontal"
        width={200}
        formatValue={(n) => `${n} runs`}
      />,
    );
    const gridlines = container.querySelectorAll('line.upmo-chart__grid');
    const labels = xLabels(container).filter((t) => t?.endsWith('runs'));
    expect(gridlines.length).toBeGreaterThanOrEqual(4);
    expect(gridlines.length).toBeLessThanOrEqual(5);
    expect(labels).toHaveLength(gridlines.length);
  });

  it('starts the first horizontal tick label at the axis so it never reaches the group labels', () => {
    const { container } = renderThemed(
      <GroupedBarChart title="H" groups={groups} orientation="horizontal" formatValue={(n) => `${n} runs`} />,
    );
    const first = container.querySelector('.upmo-chart__tick--x') as SVGTextElement;
    const groupLabel = container.querySelector('.upmo-chart__tick:not(.upmo-chart__tick--x)') as SVGTextElement;
    expect(first).toHaveAttribute('text-anchor', 'start');
    // Group labels end left of the axis, the first tick starts on it.
    expect(Number(first.getAttribute('x'))).toBeGreaterThan(Number(groupLabel.getAttribute('x')));
    expect(groupLabel).toHaveAttribute('text-anchor', 'end');
  });

  it('shows the group in a readout on focus, arrow keys and hover', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    const figure = focusChart('Runs');
    expect(readoutText(container)).toBe('Mon: Passed 30, Failed 4');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Tue: Passed 42, Failed no data');
    fireEvent.mouseEnter(container.querySelectorAll('.upmo-chart__hit')[2]);
    expect(readoutText(container)).toBe('Wed: Passed 25 runs, Failed 0');
  });

  it('shows an empty state with no groups', () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={[]} />);
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('thins the group labels when they would overlap', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ label: `Week ${i + 1}`, bars: [{ name: 'Runs', value: i }] }));
    const { container } = renderThemed(<GroupedBarChart title="Many" groups={many} width={240} />);
    expect(xLabels(container).length).toBeLessThan(20);
  });
});

describe('ComboChart', () => {
  const bars = { name: 'Runs', points: days.map((label, i) => ({ label, value: [30, null, 50, 80][i] })) };
  const rate = { name: 'Success rate', points: days.map((label, i) => ({ label, value: [90, 95, null, 99][i] })) };

  it('renders a labelled group with a hidden drawing', () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    expect(screen.getByRole('group', { name: 'Runs and success' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect([...container.querySelectorAll('.upmo-chart__legend-item')].map((i) => i.textContent)).toEqual([
      'Runs',
      'Success rate',
    ]);
  });

  it('labels both axes with ticks and the series names', () => {
    const { container } = renderThemed(
      <ComboChart
        title="Runs and success"
        bars={bars}
        line={rate}
        formatBar={(n) => `${n} runs`}
        formatLine={(n) => `${n}%`}
      />,
    );
    const ticks = yTicks(container);
    const left = ticks.filter((t) => t?.endsWith('runs'));
    const right = ticks.filter((t) => t?.endsWith('%'));
    expect(left.length).toBeGreaterThanOrEqual(4);
    expect(left.length).toBeLessThanOrEqual(5);
    expect(right).toHaveLength(left.length);
    const titles = [...container.querySelectorAll('.upmo-chart__axis-title')].map((t) => t.textContent);
    expect(titles).toEqual(['Runs', 'Success rate']);
  });

  it('exposes every value in a hidden table', () => {
    renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} formatLine={(n) => `${n}%`} />);
    const table = screen.getByRole('table', { name: 'Runs and success' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Label',
      'Runs',
      'Success rate',
    ]);
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['30', '90%']);
  });

  it('skips a null bar and leaves a gap in a null line, never zero', () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    expect(container.querySelectorAll('.upmo-combo__bar')).toHaveLength(3);
    // 90, 95, null, 99: a run of two and a lone point.
    expect(container.querySelectorAll('.upmo-combo__line')).toHaveLength(1);
    expect(container.querySelectorAll('svg.upmo-chart__svg .upmo-chart__marker[data-marker]')).toHaveLength(3);
    const rows = within(screen.getByRole('table', { name: 'Runs and success' })).getAllByRole('row');
    expect(within(rows[2]).getAllByRole('cell')[0]).toHaveTextContent('No data');
    expect(within(rows[3]).getAllByRole('cell')[1]).toHaveTextContent('No data');
  });

  it('shows both values in a readout on focus, arrow keys and hover', () => {
    const { container } = renderThemed(
      <ComboChart title="Runs and success" bars={bars} line={rate} formatLine={(n) => `${n}%`} />,
    );
    const figure = focusChart('Runs and success');
    expect(readoutText(container)).toBe('Mon: Runs 30, Success rate 90%');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Tue: Runs no data, Success rate 95%');
    fireEvent.mouseEnter(container.querySelectorAll('.upmo-chart__hit')[3]);
    expect(readoutText(container)).toBe('Thu: Runs 80, Success rate 99%');
  });

  it('shows an empty state with no points', () => {
    const { container } = renderThemed(
      <ComboChart title="Runs and success" bars={{ name: 'Runs', points: [] }} line={{ name: 'Rate', points: [] }} />,
    );
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('uses the longer series for the x labels and shows gaps in the shorter', () => {
    const shortBars = { name: 'Runs', points: days.slice(0, 3).map((label, i) => ({ label, value: [30, 40, 50][i] })) };
    const longLine = {
      name: 'Success rate',
      points: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => ({ label, value: 80 + i })),
    };
    const { container } = renderThemed(<ComboChart title="Uneven" bars={shortBars} line={longLine} />);
    expect(xLabels(container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(container.querySelectorAll('.upmo-combo__bar')).toHaveLength(3);
    expect(container.querySelectorAll('svg.upmo-chart__svg .upmo-chart__marker[data-marker]')).toHaveLength(6);
    const rows = within(screen.getByRole('table', { name: 'Uneven' })).getAllByRole('row');
    expect(rows).toHaveLength(7);
    expect(within(rows[6]).getByRole('rowheader')).toHaveTextContent('Sat');
    expect(within(rows[6]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['No data', '85']);
    expect(within(rows[4]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['No data', '83']);
  });

  it('uses the longer bars the same way, with gaps in the line', () => {
    const longBars = { name: 'Runs', points: days.map((label, i) => ({ label, value: i + 1 })) };
    const shortLine = { name: 'Rate', points: days.slice(0, 2).map((label, i) => ({ label, value: 90 + i })) };
    const { container } = renderThemed(<ComboChart title="Uneven bars" bars={longBars} line={shortLine} />);
    expect(xLabels(container)).toEqual(days);
    expect(container.querySelectorAll('.upmo-combo__bar')).toHaveLength(4);
    const rows = within(screen.getByRole('table', { name: 'Uneven bars' })).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(within(rows[4]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['4', 'No data']);
  });

  it('thins the x labels when they would overlap', () => {
    const many = (name: string) => ({
      name,
      points: Array.from({ length: 30 }, (_, i) => ({ label: `Day ${i + 1}`, value: i })),
    });
    const { container } = renderThemed(<ComboChart title="Many" bars={many('A')} line={many('B')} width={240} />);
    expect(xLabels(container).length).toBeLessThan(30);
  });
});

describe('LineChart single series', () => {
  const svgAttributes = (container: HTMLElement) =>
    [...container.querySelectorAll('svg *')].flatMap((el) => [...el.attributes].map((a) => a.value));

  it('ignores NaN and Infinity, and never writes NaN into an svg attribute', () => {
    const data = [
      { label: 'A', value: Number.NaN },
      { label: 'B', value: 10 },
      { label: 'C', value: Number.POSITIVE_INFINITY },
      { label: 'D', value: 4 },
      { label: 'E', value: 8 },
      { label: 'F', value: Number.NEGATIVE_INFINITY },
    ];
    const { container } = renderThemed(<LineChart title="Spend" data={data} />);
    const attributes = svgAttributes(container);
    expect(attributes.length).toBeGreaterThan(0);
    for (const value of attributes) expect(value).not.toMatch(/NaN|Infinity/);
    // 10 alone, then 4 and 8: the gaps break the line.
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
  });

  it('scales to the finite values only', () => {
    const clean = renderThemed(
      <LineChart title="Clean" data={[{ label: 'A', value: 2 }, { label: 'B', value: 4 }]} />,
    );
    const withNaN = renderThemed(
      <LineChart
        title="Dirty"
        data={[{ label: 'A', value: 2 }, { label: 'B', value: 4 }, { label: 'C', value: Number.NaN }]}
      />,
    );
    const ys = (c: HTMLElement) =>
      (c.querySelector('polyline')?.getAttribute('points') ?? '').split(' ').map((p) => p.split(',')[1]);
    expect(ys(withNaN.container)).toEqual(ys(clean.container));
  });

  it('draws nothing but stays valid when every value is non-finite', () => {
    const { container } = renderThemed(
      <LineChart title="Empty" data={[{ label: 'A', value: Number.NaN }, { label: 'B', value: Number.NaN }]} />,
    );
    for (const value of svgAttributes(container)) expect(value).not.toMatch(/NaN/);
    expect(container.querySelectorAll('polyline')).toHaveLength(0);
  });
});

describe('chart width fallback', () => {
  const viewBoxWidth = (container: HTMLElement) =>
    container.querySelector('svg.upmo-chart__svg')?.getAttribute('viewBox')?.split(' ')[2];

  it('follows the width prop when the container has no measurable width', () => {
    const { container, rerender } = renderThemed(
      <GroupedBarChart title="Runs" width={480} groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }] }]} />,
    );
    expect(viewBoxWidth(container)).toBe('480');
    rerender(<GroupedBarChart title="Runs" width={240} groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }] }]} />);
    expect(viewBoxWidth(container)).toBe('240');
  });

  it('disconnects its ResizeObserver when it unmounts or the fallback changes', () => {
    const disconnect = vi.fn();
    class FakeObserver {
      observe() {}
      disconnect = disconnect;
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    try {
      const groups = [{ label: 'Mon', bars: [{ name: 'A', value: 1 }] }];
      const { rerender, unmount } = renderThemed(<GroupedBarChart title="Runs" width={480} groups={groups} />);
      expect(disconnect).not.toHaveBeenCalled();
      rerender(<GroupedBarChart title="Runs" width={300} groups={groups} />);
      expect(disconnect).toHaveBeenCalledTimes(1);
      unmount();
      expect(disconnect).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('chart docs', () => {
  it('says a null point in a stacked series contributes nothing to the stack', () => {
    const doc = readFileSync(
      resolve(__dirname, '../../../apps/docs/src/content/docs/charts/line-chart.mdx'),
      'utf8',
    );
    const stacked = doc.slice(doc.indexOf('## Stacked areas'));
    expect(stacked.replace(/\s+/g, ' ')).toContain(
      'A missing (`null`) point in a stacked series contributes nothing to the stack',
    );
  });
});

describe('every multi-series chart', () => {
  it('has no axe violations', async () => {
    const { baseElement } = renderThemed(
      <>
        <LineChart title="L" series={[line('A', [1, null, 3, 4]), line('B', [2, 3, 4, 5])]} />
        <DonutChart title="D" data={[{ label: 'A', value: 1 }, { label: 'B', value: 3 }]} />
        <GroupedBarChart title="G" groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }, { name: 'B', value: null }] }]} />
        <ComboChart
          title="C"
          bars={{ name: 'A', points: [{ label: 'Mon', value: 1 }] }}
          line={{ name: 'B', points: [{ label: 'Mon', value: 2 }] }}
        />
        <LineChart title="E" series={[]} />
      </>,
    );
    // jsdom has no layout, so colour contrast is covered by the token tests.
    const results = await act(() =>
      axe.run(baseElement, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } }),
    );
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it('mounts in light, dark and high contrast', () => {
    for (const theme of themes) {
      const ui = (
        <>
          <LineChart title="L" series={[line('A', [1, 2, 3, 4])]} />
          <DonutChart title="D" data={[{ label: 'A', value: 1 }]} />
          <GroupedBarChart title="G" groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }] }]} />
          <ComboChart
            title="C"
            bars={{ name: 'A', points: [{ label: 'Mon', value: 1 }] }}
            line={{ name: 'B', points: [{ label: 'Mon', value: 2 }] }}
          />
        </>
      );
      const { unmount } = renderThemed(ui, theme);
      expect(screen.getAllByRole('group')).toHaveLength(4);
      unmount();
    }
  });

  it('does not animate, so there is no motion to reduce', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles.css'), 'utf8');
    const start = css.indexOf('/* Multi-series charts');
    const end = css.indexOf('/* UsageMeter. */');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(css.slice(start, end)).not.toMatch(/transition|animation/);
  });
});
