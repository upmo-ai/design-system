import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComboChart, DonutChart, GroupedBarChart, LineChart, type LineSeries } from '../src/index.ts';
import { actionsOf, charts, lastOption, live, resetCharts, type Opt } from './fake-echarts.ts';
import { renderThemed, themes, type PreviewTheme } from './render.tsx';

// jsdom cannot draw ECharts (no layout), so the drawing is replaced by a fake that
// records the options and actions the charts hand it. The behaviour under test is
// what the charts ask ECharts to draw, and the HTML around it.
vi.mock('../src/charts/echartsSetup.ts', () => import('./fake-echarts.ts'));

const days = ['Mon', 'Tue', 'Wed', 'Thu'];

const TOKENS = `
  :root {
    --chart-1: rgb(11, 22, 33); --chart-2: rgb(12, 23, 34); --chart-3: rgb(13, 24, 35);
    --chart-4: rgb(14, 25, 36); --chart-5: rgb(15, 26, 37); --chart-6: rgb(16, 27, 38);
    --chart-mid: rgb(77, 78, 79);
    --ink: rgb(1, 1, 1); --ink-muted: rgb(2, 2, 2); --border: rgb(3, 3, 3); --surface-100: rgb(250, 250, 250);
  }
  [data-theme='dark'] { --chart-1: rgb(44, 55, 66); --chart-mid: rgb(88, 89, 90); }
  html[data-theme='dark'] { --ink: rgb(9, 9, 9); }
`;
const CHART_1 = 'rgb(11, 22, 33)';
const CHART_2 = 'rgb(12, 23, 34)';
const CHART_MID = 'rgb(77, 78, 79)';

let tokenStyle: HTMLStyleElement;

beforeEach(() => {
  resetCharts();
  tokenStyle = document.createElement('style');
  tokenStyle.textContent = TOKENS;
  document.head.append(tokenStyle);
});

/** Lets charts that are still loading ECharts finish inside act, so no update lands after the test. */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const cleanups: (() => void)[] = [];

afterEach(() => {
  tokenStyle.remove();
  vi.unstubAllGlobals();
  for (const cleanup of cleanups.splice(0)) cleanup();
});

function line(name: string, values: (number | null)[], extra: Partial<LineSeries> = {}): LineSeries {
  return { name, points: values.map((value, i) => ({ label: days[i] ?? `D${i + 1}`, value })), ...extra };
}

/** Waits until `count` charts have loaded ECharts and been given their option. */
async function drawn(container: HTMLElement, count = 1) {
  await waitFor(() => expect(container.querySelectorAll('[data-chart-ready="true"]')).toHaveLength(count));
}

const readoutText = (container: HTMLElement) => container.querySelector('.upmo-chart__readout')?.textContent;
const legendButtons = (name: string) => within(screen.getByRole('list', { name })).getAllByRole('button');

function focusChart(name: string) {
  const figure = screen.getByRole('group', { name });
  act(() => figure.focus());
  return figure;
}

/** The rows of a tooltip's html as [name, value, swatch colour]. */
function tipRows(html: string): string[][] {
  const box = document.createElement('div');
  box.innerHTML = html;
  return [...box.querySelectorAll('.upmo-chart__tip-row')].map((row) => [
    row.querySelector('.upmo-chart__tip-name')?.textContent ?? '',
    row.querySelector('.upmo-chart__tip-value')?.textContent ?? '',
    (row.querySelector('.upmo-chart__tip-swatch') as HTMLElement | null)?.getAttribute('style') ?? '',
  ]);
}

const ticksOf = (axis: Opt) => Math.round((axis.max - axis.min) / axis.interval) + 1;
const drawnSeries = (opt: Opt): Opt[] => opt.series.filter((s: Opt) => !String(s.id).endsWith('-lone'));

/** Gives every element a client size in jsdom (which has no layout), until restored. */
function stubHostSize(width: number, height: number) {
  const state = { width, height };
  const original = {
    w: Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth'),
    h: Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight'),
  };
  Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => state.width });
  Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => state.height });
  cleanups.push(() => {
    if (original.w) Object.defineProperty(Element.prototype, 'clientWidth', original.w);
    if (original.h) Object.defineProperty(Element.prototype, 'clientHeight', original.h);
  });
  return {
    set(w: number, h: number) {
      state.width = w;
      state.height = h;
    },
  };
}

function stubMedia(matching: string[]) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe('LineChart series', () => {
  const series = [line('Input', [10, 20, 30, 40]), line('Output', [5, 6, 7, 8])];

  it('renders a labelled, focusable group; the drawing is hidden from assistive tech', async () => {
    const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
    const group = screen.getByRole('group', { name: 'Tokens' });
    expect(group).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('.upmo-chart__plot')).toHaveAttribute('aria-hidden', 'true');
    await drawn(container);
    expect(live()).toHaveLength(1);
    expect(live()[0].initOptions.renderer).toBe('svg');
  });

  it('holds the plot height with a placeholder while ECharts loads, then swaps it out', async () => {
    const { container } = renderThemed(<LineChart title="Tokens" series={series} height={180} />);
    const plot = container.querySelector('.upmo-chart__plot') as HTMLElement;
    expect(plot.style.height).toBe('180px');
    expect(plot.querySelector('.upmo-chart__loading')).toBeTruthy();
    expect(charts).toHaveLength(0);
    await drawn(container);
    expect(plot.querySelector('.upmo-chart__loading')).toBeNull();
    expect(plot.style.height).toBe('180px');
  });

  it('exposes every point in a hidden table captioned with the title', async () => {
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
    await settle();
  });

  describe('legend', () => {
    it('is a compact list of toggles with a round swatch, the name, and Mean and Max', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={series} formatValue={(n) => `${n} tok`} />);
      const items = [...container.querySelectorAll('.upmo-chart__legend-item')];
      expect(items).toHaveLength(2);
      expect(items[0].querySelector('.upmo-chart__legend-name')?.textContent).toBe('Input');
      expect(items[0].querySelector('.upmo-chart__dot')?.getAttribute('style')).toContain('--chart-1');
      expect([...items[0].querySelectorAll('.upmo-chart__legend-stat')].map((s) => s.textContent)).toEqual([
        'Mean 25 tok',
        'Max 40 tok',
      ]);
      expect([...items[1].querySelectorAll('.upmo-chart__legend-stat')].map((s) => s.textContent)).toEqual([
        'Mean 6.5 tok',
        'Max 8 tok',
      ]);
      await settle();
    });

    it('prints compact numbers (536k, 2.3M) and never a long decimal when the caller gave no formatter', async () => {
      const big = [line('Tokens', [300_000, 536_440.143, 400_000, 2_300_000])];
      const { container } = renderThemed(<LineChart title="Big" series={big} />);
      const stats = [...container.querySelectorAll('.upmo-chart__legend-stat')].map((s) => s.textContent);
      expect(stats).toEqual(['Mean 884k', 'Max 2.3M']);
      expect(container.querySelector('.upmo-chart__legend-list')?.textContent).not.toMatch(/\.\d{3,}/);
      await settle();
    });

    it("hands a tidy value to the caller's formatter, so a long decimal never reaches it", async () => {
      const seen: number[] = [];
      const big = [line('Spend', [300_000, 536_440.143, 400_000, 2_300_000])];
      const { container } = renderThemed(
        <LineChart
          title="Spend"
          series={big}
          formatValue={(n) => {
            seen.push(n);
            return `$${n}`;
          }}
        />,
      );
      const stats = [...container.querySelectorAll('.upmo-chart__legend-stat')].map((s) => s.textContent);
      expect(stats).toEqual(['Mean $884110', 'Max $2300000']);
      expect(stats.join(' ')).not.toMatch(/\.\d{3,}/);
      await settle();
    });

    it('can be hidden', async () => {
      renderThemed(<LineChart title="Tokens" series={series} legend={false} />);
      expect(screen.queryByRole('list', { name: 'Tokens series' })).toBeNull();
      await settle();
    });

    it('hides and shows a series on click, Enter and Space, marking the hidden one', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
      await drawn(container);
      const [input] = legendButtons('Tokens series');
      expect(input).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(input);
      await waitFor(() => expect(drawnSeries(lastOption()).map((s) => s.name)).toEqual(['Output']));
      expect(legendButtons('Tokens series')[0]).toHaveAttribute('aria-pressed', 'false');
      expect(live()[0].replaced.at(-1)).toBe(true);

      // Enter and Space are a button's own click, which the browser sends; a click stands in for both here.
      fireEvent.click(legendButtons('Tokens series')[0]);
      await waitFor(() => expect(drawnSeries(lastOption()).map((s) => s.name)).toEqual(['Input', 'Output']));
      expect(legendButtons('Tokens series')[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('is a native button, so Enter and Space work and it is a tab stop', async () => {
      renderThemed(<LineChart title="Tokens" series={series} />);
      const [input] = legendButtons('Tokens series');
      expect(input.tagName).toBe('BUTTON');
      expect(input).toHaveAttribute('type', 'button');
      expect(input).not.toHaveAttribute('tabindex', '-1');
      await settle();
    });

    it('keeps at least one series visible', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
      await drawn(container);
      fireEvent.click(legendButtons('Tokens series')[0]);
      await waitFor(() => expect(drawnSeries(lastOption())).toHaveLength(1));
      const last = legendButtons('Tokens series')[1];
      expect(last).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(last);
      expect(last).toHaveAttribute('aria-pressed', 'true');
      expect(drawnSeries(lastOption()).map((s) => s.name)).toEqual(['Output']);
    });

    it('recomputes the stacked totals when a series is hidden', async () => {
      const stacked = [line('Input', [10, 20, 30, 40]), line('Output', [5, 6, 7, 8]), line('Tool defs', [1, 1, 1, 1])];
      const { container } = renderThemed(<LineChart title="Tokens" stacked series={stacked} />);
      await drawn(container);
      expect(lastOption().yAxis.max).toBeGreaterThanOrEqual(49);
      fireEvent.click(legendButtons('Tokens series')[0]);
      await waitFor(() => expect(drawnSeries(lastOption())).toHaveLength(2));
      // Output plus Tool defs peak at 9, so the axis shrinks with the stack.
      expect(lastOption().yAxis.max).toBeLessThan(20);
      expect(drawnSeries(lastOption()).map((s) => s.stack)).toEqual(['total', 'total']);
    });

    it('highlights a series in the plot while its item is hovered or focused', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={series} />);
      await drawn(container);
      const [input] = legendButtons('Tokens series');
      fireEvent.mouseEnter(input);
      expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesId: 's0' });
      fireEvent.mouseLeave(input);
      expect(actionsOf('downplay').at(-1)).toEqual({ type: 'downplay', seriesId: 's0' });
      fireEvent.focus(input);
      expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesId: 's0' });
      fireEvent.blur(input);
      expect(actionsOf('downplay')).toHaveLength(2);
    });
  });

  it('draws a null as a gap in the line, never as zero', async () => {
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
    await drawn(container);
    const spend = drawnSeries(lastOption())[0];
    expect(spend.data).toEqual([1, 2, null, 4, 5]);
    expect(spend.connectNulls).toBe(false);
    const table = screen.getByRole('table', { name: 'Spend' });
    expect(within(within(table).getAllByRole('row')[3]).getByRole('cell')).toHaveTextContent('No data');
    // The mean is over the four real values (3), not five with a zero (2.4).
    expect(container.querySelector('.upmo-chart__legend-stat')?.textContent).toBe('Mean 3');
  });

  it('draws an axis with four or five nice ticks and formats them', async () => {
    const { container } = renderThemed(
      <LineChart title="Spend" series={[line('Spend', [0, 400, 900, 1284])]} formatValue={(n) => `€${n}`} />,
    );
    await drawn(container);
    const axis = lastOption().yAxis;
    expect(ticksOf(axis)).toBeGreaterThanOrEqual(4);
    expect(ticksOf(axis)).toBeLessThanOrEqual(5);
    expect([axis.min, axis.max, axis.interval]).toEqual([0, 1500, 500]);
    expect(axis.axisLabel.formatter(500)).toBe('€500');
  });

  it('uses compact axis labels without a formatter', async () => {
    const { container } = renderThemed(<LineChart title="Big" series={[line('Big', [0, 500_000, 1_500_000, 2_300_000])]} />);
    await drawn(container);
    expect(lastOption().yAxis.axisLabel.formatter(1_500_000)).toBe('1.5M');
    expect(lastOption().yAxis.axisLabel.formatter(500_000)).toBe('500k');
  });

  describe('keyboard', () => {
    const gappy = [line('Input', [10, 20, 30, 40]), line('Output', [5, null, 7, 8])];

    it('shows a readout on focus and moves with the arrow keys, Home, End and Escape', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={gappy} />);
      await drawn(container);
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

    it('shows the tooltip and highlight at the focused position through dispatchAction', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={gappy} />);
      await drawn(container);
      const figure = focusChart('Tokens');
      expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
      expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesId: ['s0', 's1'], dataIndex: 0 });

      fireEvent.keyDown(figure, { key: 'ArrowRight' });
      expect(actionsOf('downplay').at(-1)).toMatchObject({ seriesId: ['s0', 's1'], dataIndex: 0 });
      expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 1 });
      // Output has no value at Tue, so only Input is highlighted there.
      expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesId: ['s0'], dataIndex: 1 });

      fireEvent.keyDown(figure, { key: 'Escape' });
      expect(actionsOf('hideTip')).toHaveLength(1);
    });

    it('hides the tooltip, and never shows one, at a position where every series is null', async () => {
      const allNullFirst = [line('Input', [null, 20, 30, null]), line('Output', [null, 6, 7, null])];
      const { container } = renderThemed(<LineChart title="Tokens" series={allNullFirst} />);
      await drawn(container);
      const figure = focusChart('Tokens');
      // Focus lands on Mon, where there is nothing to anchor a tooltip to.
      expect(readoutText(container)).toBe('Mon: Input no data, Output no data');
      expect(actionsOf('showTip')).toHaveLength(0);
      expect(actionsOf('hideTip')).toHaveLength(1);

      fireEvent.keyDown(figure, { key: 'ArrowRight' });
      expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 1 });
      expect(actionsOf('hideTip')).toHaveLength(1);

      fireEvent.keyDown(figure, { key: 'End' });
      expect(readoutText(container)).toBe('Thu: Input no data, Output no data');
      expect(actionsOf('showTip')).toHaveLength(1);
      expect(actionsOf('hideTip')).toHaveLength(2);
    });

    it('clears the tooltip on blur', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={gappy} />);
      await drawn(container);
      const figure = focusChart('Tokens');
      act(() => figure.blur());
      expect(readoutText(container)).toBe('');
      expect(actionsOf('hideTip')).toHaveLength(1);
    });

    it('picks up a position that was focused before ECharts finished loading', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={gappy} />);
      focusChart('Tokens');
      expect(readoutText(container)).toBe('Mon: Input 10, Output 5');
      await drawn(container);
      expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
    });

    it('follows legend toggles: a hidden series drops out of the readout', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={gappy} />);
      await drawn(container);
      fireEvent.click(legendButtons('Tokens series')[0]);
      focusChart('Tokens');
      expect(readoutText(container)).toBe('Mon: Output 5');
    });
  });

  it('prefers a point display over formatValue in the readout', async () => {
    const { container } = renderThemed(
      <LineChart
        title="Spend"
        series={[{ name: 'Spend', points: [{ label: 'Jan', value: 1, display: 'one euro' }] }]}
        formatValue={(n) => `${n}!`}
      />,
    );
    focusChart('Spend');
    expect(readoutText(container)).toBe('Jan: Spend one euro');
    await drawn(container);
  });

  describe('tooltip', () => {
    it('lists every visible series with swatch, name and formatted value, largest first', async () => {
      const { container } = renderThemed(
        <LineChart
          title="Tokens"
          series={[line('Output', [5, 6, 7, 8]), line('Input', [10, 20, 30, 40]), line('Tools', [1, null, 3, 4])]}
          formatValue={(n) => `${n} tok`}
        />,
      );
      await drawn(container);
      const tooltip = lastOption().tooltip;
      expect(tooltip.trigger).toBe('axis');
      expect(tipRows(tooltip.formatter([{ dataIndex: 1 }]))).toEqual([
        ['Input', '20 tok', expect.stringContaining(CHART_2)],
        ['Output', '6 tok', expect.stringContaining(CHART_1)],
        ['Tools', 'No data', expect.stringContaining('rgb(13, 24, 35)')],
      ]);
    });

    it('leaves a hidden series out', async () => {
      const { container } = renderThemed(<LineChart title="Tokens" series={[line('A', [1, 2, 3, 4]), line('B', [4, 3, 2, 1])]} />);
      await drawn(container);
      fireEvent.click(legendButtons('Tokens series')[0]);
      await waitFor(() => expect(drawnSeries(lastOption())).toHaveLength(1));
      expect(tipRows(lastOption().tooltip.formatter([{ dataIndex: 0 }])).map((r) => r[0])).toEqual(['B']);
    });
  });

  it('shows an empty state for no series, and for series with no points, without loading ECharts', async () => {
    const none = renderThemed(<LineChart title="Tokens" series={[]} />);
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(none.container.querySelector('.upmo-chart__plot')).toBeNull();
    expect(screen.getByRole('group', { name: 'Tokens' })).not.toHaveAttribute('tabindex');
    none.unmount();

    const noPoints = renderThemed(<LineChart title="Tokens" series={[{ name: 'A', points: [] }]} emptyText="Nothing yet" />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(noPoints.container.querySelector('.upmo-chart__plot')).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect(charts).toHaveLength(0);
  });

  describe('look', () => {
    it('draws smooth lines by default and straight segments for curve="linear"', async () => {
      const smooth = renderThemed(<LineChart title="A" series={series} />);
      await drawn(smooth.container);
      expect(drawnSeries(lastOption()).every((s) => s.smooth === true && s.smoothMonotone === 'x')).toBe(true);
      smooth.unmount();
      resetCharts();
      const linear = renderThemed(<LineChart title="A" series={series} curve="linear" />);
      await drawn(linear.container);
      expect(drawnSeries(lastOption()).every((s) => s.smooth === false)).toBe(true);
    });

    it('draws no symbols and a width-2 line in the normal themes', async () => {
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      const opt = lastOption();
      expect(drawnSeries(opt).every((s) => s.showSymbol === false && s.lineStyle.width === 2)).toBe(true);
      expect(opt.aria.decal.show).toBe(false);
    });

    it('colours the lines from the chart tokens', async () => {
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      expect(drawnSeries(lastOption()).map((s) => s.lineStyle.color)).toEqual([CHART_1, CHART_2]);
    });

    it('honours colorIndex on a series', async () => {
      const { container } = renderThemed(
        <LineChart title="A" series={[line('A', [1, 2, 3, 4], { colorIndex: 4 }), line('B', [1, 2, 3, 4])]} />,
      );
      await drawn(container);
      expect(drawnSeries(lastOption()).map((s) => s.lineStyle.color)).toEqual(['rgb(14, 25, 36)', CHART_2]);
    });

    it('fills the area under a single series with a vertical gradient, and not under several', async () => {
      const one = renderThemed(<LineChart title="A" series={[series[0]]} />);
      await drawn(one.container);
      const fill = drawnSeries(lastOption())[0].areaStyle.color;
      expect(fill.type).toBe('linear');
      expect([fill.y, fill.y2]).toEqual([0, 1]);
      expect(fill.colorStops[0].color).toBe('rgba(11, 22, 33, 0.25)');
      expect(fill.colorStops[1].color).toBe('rgba(11, 22, 33, 0)');
      one.unmount();
      resetCharts();

      const many = renderThemed(<LineChart title="A" series={series} />);
      await drawn(many.container);
      expect(drawnSeries(lastOption()).every((s) => s.areaStyle === undefined)).toBe(true);
      many.unmount();
      resetCharts();

      const asked = renderThemed(<LineChart title="A" series={series} area />);
      await drawn(asked.container);
      expect(drawnSeries(lastOption()).every((s) => s.areaStyle?.color?.type === 'linear')).toBe(true);
    });

    it('stacks the areas and sizes the axis to the total', async () => {
      const { container } = renderThemed(
        <LineChart
          title="Tokens"
          stacked
          series={[line('Input', [10, 20, 30, 40]), line('Output', [5, 6, 7, 8]), line('Tool defs', [1, 1, 1, 1])]}
        />,
      );
      await drawn(container);
      const opt = lastOption();
      expect(drawnSeries(opt).map((s) => s.stack)).toEqual(['total', 'total', 'total']);
      expect(drawnSeries(opt).every((s) => s.areaStyle?.color?.type === 'linear')).toBe(true);
      // The largest total is 49, taller than the biggest single series (40).
      expect(opt.yAxis.max).toBeGreaterThanOrEqual(49);
    });

    it('draws a lone point, which a line cannot show, as a dot', async () => {
      const { container } = renderThemed(
        <LineChart title="Spend" series={[{ name: 'Spend', points: ['a', 'b', 'c'].map((label, i) => ({ label, value: [1, null, 3][i] })) }]} />,
      );
      await drawn(container);
      const dots = lastOption().series.find((s: Opt) => String(s.id).endsWith('-lone'));
      expect(dots.data).toEqual([1, null, 3]);
      expect(dots.silent).toBe(true);
    });
  });

  describe('series cap', () => {
    it('keeps the five highest series and merges the rest into Other in chart-mid', async () => {
      const eight = [10, 80, 30, 70, 20, 60, 50, 40].map((v, i) => line(`S${i + 1}`, [v, v, v, v]));
      const { container } = renderThemed(<LineChart title="Eight" series={eight} />);
      await drawn(container);
      const items = [...container.querySelectorAll('.upmo-chart__legend-item')];
      expect(items.map((i) => i.querySelector('.upmo-chart__legend-name')?.textContent)).toEqual([
        'S2', 'S4', 'S6', 'S7', 'S8', 'Other',
      ]);
      expect(items[5].querySelector('.upmo-chart__legend-stat')?.textContent).toBe('Mean 60');
      expect(items[5].querySelector('.upmo-chart__dot')?.getAttribute('style')).toContain('--chart-mid');
      expect(items[0].querySelector('.upmo-chart__dot')?.getAttribute('style')).toContain('--chart-1)');

      const drawnOnes = drawnSeries(lastOption());
      expect(drawnOnes).toHaveLength(6);
      expect(drawnOnes[5].name).toBe('Other');
      expect(drawnOnes[5].lineStyle.color).toBe(CHART_MID);
      // The hidden table still carries every original series.
      const table = screen.getByRole('table', { name: 'Eight' });
      expect(within(table).getAllByRole('columnheader')).toHaveLength(9);
    });

    it('uses the otherLabel for the merged series', async () => {
      const seven = Array.from({ length: 7 }, (_, i) => line(`S${i + 1}`, [i, i, i, i]));
      renderThemed(<LineChart title="Seven" series={seven} otherLabel="Rest" />);
      expect(within(screen.getByRole('list', { name: 'Seven series' })).getByText('Rest')).toBeInTheDocument();
      await settle();
    });

    it('draws six series without merging', async () => {
      const six = Array.from({ length: 6 }, (_, i) => line(`S${i + 1}`, [i, i, i, i]));
      renderThemed(<LineChart title="Six" series={six} />);
      expect(within(screen.getByRole('list', { name: 'Six series' })).queryByText('Other')).toBeNull();
      await settle();
    });
  });

  describe('theme and accessibility', () => {
    it('rebuilds with the new token colours when the theme changes', async () => {
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      const before = live()[0].options.length;
      expect(drawnSeries(lastOption())[0].lineStyle.color).toBe(CHART_1);

      await act(async () => {
        container.querySelector('[data-theme]')!.setAttribute('data-theme', 'dark');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      await waitFor(() => expect(drawnSeries(lastOption())[0].lineStyle.color).toBe('rgb(44, 55, 66)'));
      expect(live()[0].options.length).toBeGreaterThan(before);
      expect(live()[0].replaced.at(-1)).toBe(true);
    });

    it('rebuilds when the root theme attribute or the colour scheme changes', async () => {
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      const before = live()[0].options.length;
      try {
        await act(async () => {
          document.documentElement.setAttribute('data-theme', 'dark');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });
        await waitFor(() => expect(live()[0].options.length).toBeGreaterThan(before));
        expect(lastOption().textStyle.color).toBe('rgb(9, 9, 9)');
      } finally {
        await act(async () => {
          document.documentElement.removeAttribute('data-theme');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });
      }
    });

    it('adds decals, symbols and dashes in high contrast', async () => {
      const five = Array.from({ length: 5 }, (_, i) => line(`S${i + 1}`, [i + 1, i + 2, i + 3, i + 4]));
      const { container } = renderThemed(<LineChart title="Five" series={five} />, 'hc');
      await drawn(container);
      const opt = lastOption();
      expect(opt.aria.enabled).toBe(true);
      expect(opt.aria.decal.show).toBe(true);
      expect(drawnSeries(opt).every((s) => s.showSymbol === true)).toBe(true);
      expect(drawnSeries(opt).map((s) => s.symbol)).toEqual(['circle', 'rect', 'triangle', 'diamond', 'circle']);
      expect(drawnSeries(opt).map((s) => s.lineStyle.type)).toEqual(['solid', 'solid', 'solid', 'solid', 'dashed']);
    });

    it('adds them for prefers-contrast: more and forced colours in any theme', async () => {
      stubMedia(['(prefers-contrast: more)']);
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      expect(lastOption().aria.decal.show).toBe(true);
      expect(drawnSeries(lastOption())[0].showSymbol).toBe(true);
    });

    it('turns animation off for prefers-reduced-motion', async () => {
      const normal = renderThemed(<LineChart title="A" series={series} />);
      await drawn(normal.container);
      expect(lastOption().animation).toBe(true);
      normal.unmount();
      resetCharts();

      stubMedia(['(prefers-reduced-motion: reduce)']);
      const reduced = renderThemed(<LineChart title="A" series={series} />);
      await drawn(reduced.container);
      expect(lastOption().animation).toBe(false);
      expect(lastOption().tooltip.transitionDuration).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('does not rebuild for a parent render with equal data, but does for new data', async () => {
      const make = (second: number) => (
        <LineChart title="A" series={[line('Input', [10, 20, 30, 40]), line('Output', [5, second, 7, 8])]} formatValue={(n) => `${n}!`} />
      );
      const { container, rerender } = renderThemed(make(6));
      await drawn(container);
      const count = live()[0].options.length;
      rerender(make(6));
      expect(live()[0].options.length).toBe(count);
      rerender(make(60));
      await waitFor(() => expect(live()[0].options.length).toBe(count + 1));
      expect(drawnSeries(lastOption())[1].data).toEqual([5, 60, 7, 8]);
    });

    it('follows its container with a ResizeObserver and disposes on unmount', async () => {
      const disconnect = vi.fn();
      let notify: () => void = () => {};
      class FakeObserver {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect = disconnect;
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
      const size = stubHostSize(300, 200);
      const { container, unmount } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      const chart = live()[0];
      expect(chart.initOptions.width).toBeUndefined();
      expect(chart.resizes).toHaveLength(0);
      notify();
      expect(chart.resizes).toHaveLength(1);
      expect(disconnect).not.toHaveBeenCalled();
      size.set(0, 0);
      unmount();
      expect(disconnect).toHaveBeenCalled();
      expect(chart.disposed).toBe(true);
    });

    it('does not resize the chart while its host has no size, and resizes again once it is shown', async () => {
      let notify: () => void = () => {};
      class FakeObserver {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
      const size = stubHostSize(300, 200);
      const { container } = renderThemed(<LineChart title="A" series={series} />);
      await drawn(container);
      const chart = live()[0];

      // Hidden (display: none): the observer reports a 0 x 0 box.
      size.set(0, 0);
      notify();
      size.set(300, 0);
      notify();
      size.set(0, 200);
      notify();
      expect(chart.resizes).toHaveLength(0);

      // Shown again: a real size, so the chart follows it.
      size.set(300, 200);
      notify();
      expect(chart.resizes).toHaveLength(1);
      expect(chart.disposed).toBe(false);
    });

    it('draws a chart that starts hidden once its host gets a size', async () => {
      let notify: () => void = () => {};
      class FakeObserver {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
      const size = stubHostSize(0, 0);
      const { container } = renderThemed(<LineChart title="A" series={series} width={480} height={200} />);
      await drawn(container);
      expect(live()[0].initOptions).toMatchObject({ width: 480, height: 200 });

      notify();
      expect(live()[0].resizes).toHaveLength(0);

      size.set(300, 200);
      act(() => notify());
      await waitFor(() => expect(live()).toHaveLength(1));
      await drawn(container);
      const current = live()[0];
      expect(current.initOptions.width).toBeUndefined();
      expect(current.options.length).toBeGreaterThan(0);
      expect(charts.filter((c) => c.disposed)).toHaveLength(1);
    });

    it('draws at the width and height props while the container has no layout, and follows a change', async () => {
      const { container, rerender } = renderThemed(<LineChart title="A" series={series} width={480} height={200} />);
      await drawn(container);
      expect(live()[0].initOptions).toMatchObject({ renderer: 'svg', width: 480, height: 200 });
      rerender(<LineChart title="A" series={series} width={240} height={200} />);
      await waitFor(() => expect(live()[0].resizes.at(-1)).toEqual({ width: 240, height: 200 }));
    });
  });

  it('keeps the single-series data form dependency-free and unchanged', async () => {
    const { container } = renderThemed(
      <LineChart title="Spend" data={[{ label: 'a', value: 1 }, { label: 'b', value: 4 }]} />,
    );
    const figure = container.querySelector('figure') as HTMLElement;
    expect(figure.className).toBe('upmo-linechart');
    expect(figure).not.toHaveAttribute('tabindex');
    expect(container.querySelector('polyline')).toBeTruthy();
    expect(container.querySelector('.upmo-chart__legend-list')).toBeNull();
    expect(container.querySelector('.upmo-chart__readout')).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect(charts).toHaveLength(0);
  });
});

describe('DonutChart', () => {
  const data = [
    { label: 'Claude', value: 60, display: '60 runs' },
    { label: 'Nova', value: 30 },
    { label: 'Llama', value: 10 },
  ];
  const shares = (container: HTMLElement) =>
    [...container.querySelectorAll('.upmo-chart__legend-share')].map((s) => s.textContent);

  it('renders a labelled group with centre label and value', async () => {
    const { container } = renderThemed(
      <DonutChart title="Runs by model" data={data} centerLabel="Runs" centerValue="100" />,
    );
    expect(screen.getByRole('group', { name: 'Runs by model' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('.upmo-chart__plot')).toHaveAttribute('aria-hidden', 'true');
    const centre = container.querySelector('.upmo-donut__center') as HTMLElement;
    expect(centre).toHaveTextContent('Runs');
    expect(centre).toHaveTextContent('100');
    await drawn(container);
    const pie = lastOption().series[0];
    expect(pie.type).toBe('pie');
    expect(pie.data.map((d: Opt) => [d.name, d.value])).toEqual([['Claude', 60], ['Nova', 30], ['Llama', 10]]);
    expect(pie.label.show).toBe(false);
  });

  it('colours slices from the chart tokens', async () => {
    const { container } = renderThemed(<DonutChart title="Runs" data={data} />);
    await drawn(container);
    expect(lastOption().series[0].data.map((d: Opt) => d.itemStyle.color)).toEqual([
      CHART_1,
      CHART_2,
      'rgb(13, 24, 35)',
    ]);
  });

  it('defaults the centre to the formatted total', async () => {
    const { container } = renderThemed(<DonutChart title="Runs" data={data} formatValue={(n) => `${n} r`} />);
    const centre = container.querySelector('.upmo-donut__center') as HTMLElement;
    expect(centre).toHaveTextContent('Total');
    expect(centre).toHaveTextContent('100 r');
    await settle();
  });

  it('lists each slice with its label, display and percent', async () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    const rows = legendButtons('Runs by model slices');
    expect(rows.map((r) => r.textContent)).toEqual(['Claude60 runs60%', 'Nova3030%', 'Llama1010%']);
    expect(container.querySelector('.upmo-chart__dot')?.getAttribute('style')).toContain('--chart-1');
    await settle();
  });

  it('exposes every slice in a hidden table', async () => {
    renderThemed(<DonutChart title="Runs by model" data={data} />);
    const rows = within(screen.getByRole('table', { name: 'Runs by model' })).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Claude');
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['60 runs', '60%']);
    await settle();
  });

  it('merges slices beyond the fifth into Other in chart-mid', async () => {
    const seven = Array.from({ length: 7 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
    const { container } = renderThemed(<DonutChart title="Models" data={seven} />);
    await drawn(container);
    const rows = legendButtons('Models slices');
    expect(rows).toHaveLength(6);
    expect(rows[5].textContent).toBe('Other2029%');
    expect(rows[5].querySelector('.upmo-chart__dot')?.getAttribute('style')).toContain('--chart-mid');
    const slices = lastOption().series[0].data;
    expect(slices).toHaveLength(6);
    expect(slices[5].itemStyle.color).toBe(CHART_MID);
    // The hidden table keeps all seven.
    expect(within(screen.getByRole('table', { name: 'Models' })).getAllByRole('row')).toHaveLength(8);
  });

  it('does not merge five slices or fewer', async () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
    renderThemed(<DonutChart title="Models" data={five} />);
    expect(legendButtons('Models slices')).toHaveLength(5);
    expect(screen.queryByText('Other')).toBeNull();
    await settle();
  });

  it('adds fill patterns in high contrast only', async () => {
    const normal = renderThemed(<DonutChart title="Models" data={data} />);
    await drawn(normal.container);
    expect(lastOption().aria.decal.show).toBe(false);
    normal.unmount();
    resetCharts();
    const hc = renderThemed(<DonutChart title="Models" data={data} />, 'hc');
    await drawn(hc.container);
    expect(lastOption().aria.decal.show).toBe(true);
  });

  it('draws an empty ring with the empty text for a zero total, without loading ECharts', async () => {
    const { container } = renderThemed(
      <DonutChart title="Runs" data={[{ label: 'A', value: 0 }, { label: 'B', value: 0 }]} />,
    );
    expect(container.querySelector('.upmo-donut__empty-ring')).toBeTruthy();
    expect(container.querySelector('.upmo-chart__plot')).toBeNull();
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(charts).toHaveLength(0);
  });

  it('draws an empty ring when there are no slices', async () => {
    const { container } = renderThemed(<DonutChart title="Runs" data={[]} emptyText="No runs yet" />);
    expect(container.querySelector('.upmo-donut__empty-ring')).toBeTruthy();
    expect(screen.getByText('No runs yet')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Runs' })).not.toHaveAttribute('tabindex');
    expect(container.querySelector('.upmo-chart__legend-list')).toBeNull();
    await settle();
  });

  it('counts a negative value as zero', async () => {
    const { container } = renderThemed(
      <DonutChart title="Runs" data={[{ label: 'A', value: -5 }, { label: 'B', value: 10 }]} />,
    );
    expect(legendButtons('Runs slices')[0].textContent).toBe('A00%');
    expect(shares(container)).toEqual(['0%', '100%']);
    await settle();
  });

  it('shows the slice in a readout on focus and arrow keys, and drives the tooltip', async () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    await drawn(container);
    const figure = focusChart('Runs by model');
    expect(readoutText(container)).toBe('Claude: 60 runs (60%)');
    expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Nova: 30 (30%)');
    expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesIndex: 0, dataIndex: 1 });
    expect(actionsOf('downplay').at(-1)).toMatchObject({ seriesIndex: 0, dataIndex: 0 });
    fireEvent.keyDown(figure, { key: 'End' });
    expect(readoutText(container)).toBe('Llama: 10 (10%)');
    fireEvent.keyDown(figure, { key: 'Escape' });
    expect(readoutText(container)).toBe('');
    expect(actionsOf('hideTip')).toHaveLength(1);
  });

  it('shows label, value and share in the tooltip', async () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    await drawn(container);
    expect(tipRows(lastOption().tooltip.formatter({ dataIndex: 0 }))).toEqual([
      ['60%', '60 runs', expect.stringContaining(CHART_1)],
    ]);
  });

  it('hides a slice from the legend: the ring, the shares and the centre follow', async () => {
    const { container } = renderThemed(<DonutChart title="Runs by model" data={data} />);
    await drawn(container);
    fireEvent.click(legendButtons('Runs by model slices')[0]);
    await waitFor(() => expect(lastOption().series[0].data).toHaveLength(2));
    expect(shares(container)).toEqual(['', '75%', '25%']);
    expect(container.querySelector('.upmo-donut__center-value')).toHaveTextContent('40');
    expect(legendButtons('Runs by model slices')[0]).toHaveAttribute('aria-pressed', 'false');
    // The table still lists every slice.
    expect(within(screen.getByRole('table', { name: 'Runs by model' })).getAllByRole('row')).toHaveLength(4);

    // Hovering the second item highlights the first drawn slice (the hidden one is skipped).
    fireEvent.mouseEnter(legendButtons('Runs by model slices')[1]);
    expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesIndex: 0, dataIndex: 0 });
    fireEvent.mouseEnter(legendButtons('Runs by model slices')[0]);
    expect(actionsOf('highlight')).toHaveLength(1);
  });

  it('keeps the last visible slice', async () => {
    const { container } = renderThemed(
      <DonutChart title="Two" data={[{ label: 'A', value: 1 }, { label: 'B', value: 3 }]} />,
    );
    await drawn(container);
    fireEvent.click(legendButtons('Two slices')[0]);
    await waitFor(() => expect(lastOption().series[0].data).toHaveLength(1));
    fireEvent.click(legendButtons('Two slices')[1]);
    expect(lastOption().series[0].data).toHaveLength(1);
    expect(legendButtons('Two slices')[1]).toHaveAttribute('aria-pressed', 'true');
  });

  describe('percentages', () => {
    const sum = (xs: (string | null)[]) => Math.round(xs.reduce((a, b) => a + Number.parseFloat(b ?? ''), 0) * 10) / 10;

    it('adds up to exactly 100 for three equal slices', async () => {
      const { container } = renderThemed(
        <DonutChart title="Thirds" data={['A', 'B', 'C'].map((label) => ({ label, value: 1 }))} />,
      );
      expect(shares(container)).toEqual(['34%', '33%', '33%']);
      expect(sum(shares(container))).toBe(100);
      await settle();
    });

    it('adds up to exactly 100 when rounding would overshoot', async () => {
      const rows = [25.5, 25.5, 25.5, 23.5].map((value, i) => ({ label: `S${i}`, value }));
      const { container } = renderThemed(<DonutChart title="Over" data={rows} />);
      expect(sum(shares(container))).toBe(100);
      await settle();
    });

    it('adds up to exactly 100 after the Other merge, in the legend and the table', async () => {
      const seven = Array.from({ length: 7 }, (_, i) => ({ label: `M${i + 1}`, value: 10 }));
      const { container } = renderThemed(<DonutChart title="Models" data={seven} />);
      expect(sum(shares(container))).toBe(100);
      const rows = within(screen.getByRole('table', { name: 'Models' })).getAllByRole('row').slice(1);
      expect(sum(rows.map((r) => within(r).getAllByRole('cell')[1].textContent))).toBe(100);
      await settle();
    });

    it('adds up to exactly 100 with small and large shares mixed', async () => {
      const rows = [61, 20, 12, 4.3, 2.4, 0.3].map((value, i) => ({ label: `S${i}`, value }));
      const { container } = renderThemed(<DonutChart title="Mixed" data={rows} />);
      expect(sum(shares(container))).toBe(100);
      await settle();
    });

    it('uses the rounded share in the readout', async () => {
      const { container } = renderThemed(
        <DonutChart title="Thirds" data={['A', 'B', 'C'].map((label) => ({ label, value: 1 }))} />,
      );
      focusChart('Thirds');
      expect(readoutText(container)).toBe('A: 1 (34%)');
      await settle();
    });
  });
});

describe('GroupedBarChart', () => {
  const groups = [
    { label: 'Mon', bars: [{ name: 'Passed', value: 30 }, { name: 'Failed', value: 4 }] },
    { label: 'Tue', bars: [{ name: 'Passed', value: 42 }, { name: 'Failed', value: null }] },
    { label: 'Wed', bars: [{ name: 'Passed', value: 25, display: '25 runs' }, { name: 'Failed', value: 0 }] },
  ];

  it('renders a labelled group, a hidden drawing and a legend of the bar names', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    expect(screen.getByRole('group', { name: 'Runs' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('.upmo-chart__plot')).toHaveAttribute('aria-hidden', 'true');
    expect(legendButtons('Runs bars').map((b) => b.textContent)).toEqual(['Passed', 'Failed']);
    expect(container.querySelector('.upmo-grouped-bar--vertical')).toBeTruthy();
    await drawn(container);
  });

  it('draws rounded-top bars of at most 28px in chart-1 to chart-3 by bar index', async () => {
    const three = groups.map((g) => ({ ...g, bars: [...g.bars, { name: 'Skipped', value: 2 }] }));
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={three} />);
    await drawn(container);
    const opt = lastOption();
    expect(opt.series.map((s: Opt) => s.type)).toEqual(['bar', 'bar', 'bar']);
    expect(opt.series.map((s: Opt) => s.itemStyle.color)).toEqual([CHART_1, CHART_2, 'rgb(13, 24, 35)']);
    expect(opt.series[0].itemStyle.borderRadius).toEqual([3, 3, 0, 0]);
    expect(opt.series[0].barMaxWidth).toBe(28);
    expect(opt.xAxis.data).toEqual(['Mon', 'Tue', 'Wed']);
  });

  it('skips a null bar and never draws it as zero', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    await drawn(container);
    expect(lastOption().series[1].data).toEqual([4, null, 0]);
    const table = screen.getByRole('table', { name: 'Runs' });
    expect(within(within(table).getAllByRole('row')[2]).getAllByRole('cell')[1]).toHaveTextContent('No data');
  });

  it('exposes every value in a hidden table', async () => {
    renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    const rows = within(screen.getByRole('table', { name: 'Runs' })).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Label', 'Passed', 'Failed']);
    expect(within(rows[3]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['25 runs', '0']);
    await settle();
  });

  it('merges bars beyond the third into Other in chart-mid', async () => {
    const five = ['A', 'B', 'C', 'D', 'E'];
    const wide = [
      { label: 'Mon', bars: five.map((name, i) => ({ name, value: i + 1 })) },
      { label: 'Tue', bars: five.map((name, i) => ({ name, value: i + 1 })) },
    ];
    const { container } = renderThemed(<GroupedBarChart title="Wide" groups={wide} />);
    await drawn(container);
    expect(legendButtons('Wide bars').map((b) => b.textContent)).toEqual(['A', 'B', 'C', 'Other']);
    const opt = lastOption();
    expect(opt.series).toHaveLength(4);
    expect(opt.series[3].itemStyle.color).toBe(CHART_MID);
    expect(opt.series[3].data).toEqual([9, 9]);
    focusChart('Wide');
    expect(readoutText(container)).toBe('Mon: A 1, B 2, C 3, Other 9');
    expect(within(screen.getByRole('table', { name: 'Wide' })).getAllByRole('columnheader')).toHaveLength(6);
  });

  it('draws horizontal bars when asked, with a category axis down the side', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} orientation="horizontal" />);
    await drawn(container);
    expect(container.querySelector('.upmo-grouped-bar--horizontal')).toBeTruthy();
    const opt = lastOption();
    expect(opt.xAxis.type).toBe('value');
    expect(opt.yAxis.type).toBe('category');
    expect(opt.yAxis.inverse).toBe(true);
    expect(opt.series[0].itemStyle.borderRadius).toEqual([0, 3, 3, 0]);
    // Three groups of two bars grow the plot beyond the minimum.
    expect((container.querySelector('.upmo-chart__plot') as HTMLElement).style.height).toBe('162px');
  });

  it('draws an axis with four or five ticks and formats them, both ways round', async () => {
    const vertical = renderThemed(<GroupedBarChart title="Runs" groups={groups} formatValue={(n) => `${n}r`} />);
    await drawn(vertical.container);
    const v = lastOption().yAxis;
    expect(ticksOf(v)).toBeGreaterThanOrEqual(4);
    expect(ticksOf(v)).toBeLessThanOrEqual(5);
    expect(v.axisLabel.formatter(20)).toBe('20r');
    vertical.unmount();
    resetCharts();

    const horizontal = renderThemed(
      <GroupedBarChart title="H" groups={groups} orientation="horizontal" formatValue={(n) => `${n}r`} />,
    );
    await drawn(horizontal.container);
    const h = lastOption().xAxis;
    expect(ticksOf(h)).toBeGreaterThanOrEqual(4);
    expect(h.axisLabel.formatter(20)).toBe('20r');
  });

  it('shows the group in a readout on focus and arrow keys, and drives the tooltip', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    await drawn(container);
    const figure = focusChart('Runs');
    expect(readoutText(container)).toBe('Mon: Passed 30, Failed 4');
    expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Tue: Passed 42, Failed no data');
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Wed: Passed 25 runs, Failed 0');
  });

  it('lists every bar of a group in the tooltip, largest first', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} formatValue={(n) => `${n} runs`} />);
    await drawn(container);
    expect(tipRows(lastOption().tooltip.formatter([{ dataIndex: 1 }])).map((r) => r.slice(0, 2))).toEqual([
      ['Passed', '42 runs'],
      ['Failed', 'No data'],
    ]);
  });

  it('hides and shows a bar from the legend', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />);
    await drawn(container);
    fireEvent.click(legendButtons('Runs bars')[1]);
    await waitFor(() => expect(lastOption().series.map((s: Opt) => s.name)).toEqual(['Passed']));
    expect(legendButtons('Runs bars')[1]).toHaveAttribute('aria-pressed', 'false');
    // The scale follows what is shown: 42 at most, not including Failed.
    fireEvent.click(legendButtons('Runs bars')[1]);
    await waitFor(() => expect(lastOption().series).toHaveLength(2));
    fireEvent.mouseEnter(legendButtons('Runs bars')[0]);
    expect(actionsOf('highlight').at(-1)).toEqual({ type: 'highlight', seriesId: 'b0' });
  });

  it('shows an empty state with no groups, without loading ECharts', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={[]} />);
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(container.querySelector('.upmo-chart__plot')).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect(charts).toHaveLength(0);
  });

  it('adds fill patterns in high contrast', async () => {
    const { container } = renderThemed(<GroupedBarChart title="Runs" groups={groups} />, 'hc');
    await drawn(container);
    expect(lastOption().aria.decal.show).toBe(true);
  });
});

describe('ComboChart', () => {
  const bars = { name: 'Runs', points: days.map((label, i) => ({ label, value: [30, null, 50, 80][i] })) };
  const rate = { name: 'Success rate', points: days.map((label, i) => ({ label, value: [90, 95, null, 99][i] })) };

  it('renders a labelled group with a hidden drawing and a two-item legend', async () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    expect(screen.getByRole('group', { name: 'Runs and success' })).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('.upmo-chart__plot')).toHaveAttribute('aria-hidden', 'true');
    expect(legendButtons('Runs and success series').map((b) => b.textContent)).toEqual(['Runs', 'Success rate']);
    await drawn(container);
  });

  it('draws bars against the left axis and a smooth line against the right axis, in chart-1 and chart-2', async () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    await drawn(container);
    const [barSeries, lineSeries] = drawnSeries(lastOption());
    expect([barSeries.type, barSeries.yAxisIndex, barSeries.itemStyle.color]).toEqual(['bar', 0, CHART_1]);
    expect([lineSeries.type, lineSeries.yAxisIndex, lineSeries.smooth, lineSeries.lineStyle.color]).toEqual([
      'line',
      1,
      true,
      CHART_2,
    ]);
  });

  it('labels both axes with ticks and the series names, and aligns their gridlines', async () => {
    const { container } = renderThemed(
      <ComboChart
        title="Runs and success"
        bars={bars}
        line={rate}
        formatBar={(n) => `${n} runs`}
        formatLine={(n) => `${n}%`}
      />,
    );
    await drawn(container);
    const [left, right] = lastOption().yAxis;
    expect(ticksOf(left)).toBeGreaterThanOrEqual(4);
    expect(ticksOf(left)).toBeLessThanOrEqual(5);
    expect(ticksOf(right)).toBe(ticksOf(left));
    expect(left.axisLabel.formatter(40)).toBe('40 runs');
    expect(right.axisLabel.formatter(95)).toBe('95%');
    expect([left.name, right.name]).toEqual(['Runs', 'Success rate']);
  });

  it('exposes every value in a hidden table', async () => {
    renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} formatLine={(n) => `${n}%`} />);
    const rows = within(screen.getByRole('table', { name: 'Runs and success' })).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(within(rows[0]).getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Label',
      'Runs',
      'Success rate',
    ]);
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['30', '90%']);
    await settle();
  });

  it('skips a null bar and leaves a gap in a null line, never zero', async () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    await drawn(container);
    const [barSeries, lineSeries] = drawnSeries(lastOption());
    expect(barSeries.data).toEqual([30, null, 50, 80]);
    expect(lineSeries.data).toEqual([90, 95, null, 99]);
    expect(lineSeries.connectNulls).toBe(false);
    const rows = within(screen.getByRole('table', { name: 'Runs and success' })).getAllByRole('row');
    expect(within(rows[2]).getAllByRole('cell')[0]).toHaveTextContent('No data');
    expect(within(rows[3]).getAllByRole('cell')[1]).toHaveTextContent('No data');
  });

  it('shows both values in a readout on focus and arrow keys, and drives the tooltip', async () => {
    const { container } = renderThemed(
      <ComboChart title="Runs and success" bars={bars} line={rate} formatLine={(n) => `${n}%`} />,
    );
    await drawn(container);
    const figure = focusChart('Runs and success');
    expect(readoutText(container)).toBe('Mon: Runs 30, Success rate 90%');
    expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
    fireEvent.keyDown(figure, { key: 'ArrowRight' });
    expect(readoutText(container)).toBe('Tue: Runs no data, Success rate 95%');
    // The bar has no value on Tue, so the tooltip anchors on the line.
    expect(actionsOf('showTip').at(-1)).toEqual({ type: 'showTip', seriesIndex: 1, dataIndex: 1 });
    fireEvent.keyDown(figure, { key: 'End' });
    expect(readoutText(container)).toBe('Thu: Runs 80, Success rate 99%');
  });

  it('shows both values in the tooltip with the formatters of each axis', async () => {
    const { container } = renderThemed(
      <ComboChart title="Runs and success" bars={bars} line={rate} formatBar={(n) => `${n} runs`} formatLine={(n) => `${n}%`} />,
    );
    await drawn(container);
    expect(tipRows(lastOption().tooltip.formatter([{ dataIndex: 3 }])).map((r) => r.slice(0, 2))).toEqual([
      ['Runs', '80 runs'],
      ['Success rate', '99%'],
    ]);
  });

  it('hides either series from the legend, and the last one stays', async () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />);
    await drawn(container);
    fireEvent.click(legendButtons('Runs and success series')[0]);
    await waitFor(() => expect(drawnSeries(lastOption()).map((s) => s.type)).toEqual(['line']));
    expect(lastOption().yAxis[0].show).toBe(false);
    fireEvent.click(legendButtons('Runs and success series')[1]);
    expect(drawnSeries(lastOption()).map((s) => s.type)).toEqual(['line']);
    fireEvent.click(legendButtons('Runs and success series')[0]);
    await waitFor(() => expect(drawnSeries(lastOption()).map((s) => s.type)).toEqual(['bar', 'line']));
  });

  it('shows an empty state with no points, without loading ECharts', async () => {
    const { container } = renderThemed(
      <ComboChart title="Runs and success" bars={{ name: 'Runs', points: [] }} line={{ name: 'Rate', points: [] }} />,
    );
    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(container.querySelector('.upmo-chart__plot')).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect(charts).toHaveLength(0);
  });

  it('uses the longer series for the x labels and shows gaps in the shorter', async () => {
    const shortBars = { name: 'Runs', points: days.slice(0, 3).map((label, i) => ({ label, value: [30, 40, 50][i] })) };
    const longLine = {
      name: 'Success rate',
      points: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => ({ label, value: 80 + i })),
    };
    const { container } = renderThemed(<ComboChart title="Uneven" bars={shortBars} line={longLine} />);
    await drawn(container);
    const opt = lastOption();
    expect(opt.xAxis.data).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(drawnSeries(opt)[0].data).toEqual([30, 40, 50, null, null, null]);
    const rows = within(screen.getByRole('table', { name: 'Uneven' })).getAllByRole('row');
    expect(rows).toHaveLength(7);
    expect(within(rows[6]).getByRole('rowheader')).toHaveTextContent('Sat');
    expect(within(rows[6]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['No data', '85']);
  });

  it('uses the longer bars the same way, with gaps in the line', async () => {
    const longBars = { name: 'Runs', points: days.map((label, i) => ({ label, value: i + 1 })) };
    const shortLine = { name: 'Rate', points: days.slice(0, 2).map((label, i) => ({ label, value: 90 + i })) };
    const { container } = renderThemed(<ComboChart title="Uneven bars" bars={longBars} line={shortLine} />);
    await drawn(container);
    expect(lastOption().xAxis.data).toEqual(days);
    expect(drawnSeries(lastOption())[1].data).toEqual([90, 91, null, null]);
    const rows = within(screen.getByRole('table', { name: 'Uneven bars' })).getAllByRole('row');
    expect(within(rows[4]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['4', 'No data']);
  });

  it('adds fill patterns and line symbols in high contrast', async () => {
    const { container } = renderThemed(<ComboChart title="Runs and success" bars={bars} line={rate} />, 'hc');
    await drawn(container);
    expect(lastOption().aria.decal.show).toBe(true);
    expect(drawnSeries(lastOption())[1].showSymbol).toBe(true);
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

  it('scales to the finite values only', async () => {
    const clean = renderThemed(<LineChart title="Clean" data={[{ label: 'A', value: 2 }, { label: 'B', value: 4 }]} />);
    const withNaN = renderThemed(
      <LineChart
        title="Dirty"
        data={[{ label: 'A', value: 2 }, { label: 'B', value: 4 }, { label: 'C', value: Number.NaN }]}
      />,
    );
    const ys = (c: HTMLElement) =>
      (c.querySelector('polyline')?.getAttribute('points') ?? '').split(' ').map((p) => p.split(',')[1]);
    expect(ys(withNaN.container)).toEqual(ys(clean.container));
    await settle();
  });

  it('draws nothing but stays valid when every value is non-finite', () => {
    const { container } = renderThemed(
      <LineChart title="Empty" data={[{ label: 'A', value: Number.NaN }, { label: 'B', value: Number.NaN }]} />,
    );
    for (const value of svgAttributes(container)) expect(value).not.toMatch(/NaN/);
    expect(container.querySelectorAll('polyline')).toHaveLength(0);
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

  it('says on every multi-series chart page that it is built on ECharts and loaded lazily', () => {
    for (const page of ['line-chart', 'donut-chart', 'grouped-bar-chart', 'combo-chart']) {
      const doc = readFileSync(resolve(__dirname, `../../../apps/docs/src/content/docs/charts/${page}.mdx`), 'utf8');
      expect(doc.replace(/\s+/g, ' '), page).toContain('Built on ECharts, loaded lazily');
    }
  });
});

describe('every multi-series chart', () => {
  const everyChart = (
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
    </>
  );

  it('has no axe violations, before and after ECharts has loaded', async () => {
    const { baseElement, container } = renderThemed(everyChart);
    // jsdom has no layout, so colour contrast is covered by the token tests.
    const check = () =>
      act(() => axe.run(baseElement, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } }));
    expect((await check()).violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    await drawn(container, 4);
    expect((await check()).violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it('mounts in light, dark and high contrast', async () => {
    for (const theme of themes as PreviewTheme[]) {
      resetCharts();
      const { container, unmount } = renderThemed(
        <>
          <LineChart title="L" series={[line('A', [1, 2, 3, 4])]} />
          <DonutChart title="D" data={[{ label: 'A', value: 1 }]} />
          <GroupedBarChart title="G" groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }] }]} />
          <ComboChart
            title="C"
            bars={{ name: 'A', points: [{ label: 'Mon', value: 1 }] }}
            line={{ name: 'B', points: [{ label: 'Mon', value: 2 }] }}
          />
        </>,
        theme,
      );
      expect(screen.getAllByRole('group')).toHaveLength(4);
      await drawn(container, 4);
      expect(live().map((c) => c.options.at(-1).aria.decal.show)).toEqual([theme === 'hc', theme === 'hc', theme === 'hc', theme === 'hc']);
      unmount();
      expect(live()).toHaveLength(0);
    }
  });

  it('keeps animation out of the stylesheet; motion is the option, which follows reduced motion', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles.css'), 'utf8');
    const start = css.indexOf('/* Multi-series charts');
    const end = css.indexOf('/* UsageMeter. */');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(css.slice(start, end)).not.toMatch(/transition|animation/);
  });
});
