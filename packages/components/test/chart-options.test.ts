import { describe, expect, it } from 'vitest';
import {
  axisNavPlan,
  barTipRows,
  comboOption,
  comboScales,
  donutOption,
  groupedBarOption,
  lineOption,
  lineScale,
  lineTipRows,
  lonePoints,
  sliceNavPlan,
  sortTipRows,
  stackTops,
  tipHtml,
  type BarRow,
  type LineRow,
} from '../src/charts/chartOptions.ts';
import type { ChartTheme } from '../src/charts/chartTheme.ts';
import type { Opt } from './fake-echarts.ts';

const colors = {
  '--chart-1': 'rgb(11, 11, 11)',
  '--chart-2': 'rgb(22, 22, 22)',
  '--chart-3': 'rgb(33, 33, 33)',
  '--chart-4': 'rgb(44, 44, 44)',
  '--chart-5': 'rgb(55, 55, 55)',
  '--chart-6': 'rgb(66, 66, 66)',
  '--chart-mid': 'rgb(77, 77, 77)',
};

const theme: ChartTheme = {
  colors,
  ink: 'rgb(1, 1, 1)',
  inkMuted: 'rgb(2, 2, 2)',
  border: 'rgb(3, 3, 3)',
  borderStrong: 'rgb(4, 4, 4)',
  surface: 'rgb(250, 250, 250)',
  surfaceHover: 'rgb(240, 240, 240)',
  fontFamily: 'Inter',
  fontSize: 12,
  bodySize: 13,
  contrast: false,
  reducedMotion: false,
};
const contrastTheme: ChartTheme = { ...theme, contrast: true };

const identity = (n: number) => String(n);

/** The drawn series, without the silent dots that stand in for isolated points. */
const main = (opt: Opt): Opt[] => opt.series.filter((s: Opt) => !String(s.id).endsWith('-lone'));
const style = (marker: LineRow['style']['marker'], dashed = false) => ({ marker, dashed });

const row = (key: string, name: string, n: number, values: (number | null)[], dashed = false): LineRow => ({
  key,
  name,
  color: `var(--chart-${n})`,
  values,
  displays: values.map(() => undefined),
  style: style(n === 1 ? 'circle' : 'square', dashed),
});

const labels = ['Mon', 'Tue', 'Wed', 'Thu'];
const input = row('s0', 'Input', 1, [10, 20, 30, 40]);
const output = row('s1', 'Output', 2, [5, null, 7, 8]);

function lineOpt(over: Partial<Parameters<typeof lineOption>[0]> = {}, t = theme): Opt {
  return lineOption(
    { labels, rows: [input, output], stacked: false, area: false, curve: 'smooth', tick: identity, tip: identity, ...over },
    t,
  );
}

describe('lineOption', () => {
  it('draws smooth monotone lines of width 2 with no symbols until hover', () => {
    const opt = lineOpt();
    expect(main(opt)).toHaveLength(2);
    for (const s of main(opt)) {
      expect(s.type).toBe('line');
      expect(s.smooth).toBe(true);
      expect(s.smoothMonotone).toBe('x');
      expect(s.showSymbol).toBe(false);
      expect(s.lineStyle.width).toBe(2);
      expect(s.connectNulls).toBe(false);
    }
  });

  it('draws straight segments for curve="linear"', () => {
    expect(main(lineOpt({ curve: 'linear' })).every((s: Opt) => s.smooth === false)).toBe(true);
  });

  it('takes colours from the resolved tokens, never from a var() reference', () => {
    const opt = lineOpt();
    expect(opt.series[0].lineStyle.color).toBe(colors['--chart-1']);
    expect(opt.series[1].lineStyle.color).toBe(colors['--chart-2']);
    expect(JSON.stringify(opt, (_k, v) => (typeof v === 'function' ? undefined : v))).not.toContain('var(--chart');
  });

  it('keeps a null as a null in the data, never zero', () => {
    expect(lineOpt().series[1].data).toEqual([5, null, 7, 8]);
  });

  it('lays out a contained grid with light split lines and muted compact labels', () => {
    const opt = lineOpt({ tick: (n) => `<${n}>` });
    expect(opt.grid.containLabel).toBe(true);
    expect(opt.yAxis.splitLine.lineStyle.color).toBe(theme.border);
    expect(opt.yAxis.axisLabel.color).toBe(theme.inkMuted);
    expect(opt.yAxis.axisLabel.formatter(500)).toBe('<500>');
    expect(opt.xAxis.data).toEqual(labels);
  });

  it('puts the y axis on a nice scale with four or five ticks', () => {
    const opt = lineOpt();
    const ticks = (opt.yAxis.max - opt.yAxis.min) / opt.yAxis.interval + 1;
    expect(ticks).toBeGreaterThanOrEqual(4);
    expect(ticks).toBeLessThanOrEqual(5);
    expect(opt.yAxis.max).toBeGreaterThanOrEqual(40);
  });

  it('shows an axis pointer line and a floating tooltip', () => {
    const opt = lineOpt();
    expect(opt.tooltip.trigger).toBe('axis');
    expect(opt.tooltip.axisPointer.type).toBe('line');
    expect(opt.tooltip.confine).toBe(true);
  });

  it('fills an area with a vertical gradient of the series colour, fading to nothing at the baseline', () => {
    const opt = lineOpt({ area: true });
    const fill = opt.series[0].areaStyle.color;
    expect(fill.type).toBe('linear');
    expect([fill.x, fill.y, fill.x2, fill.y2]).toEqual([0, 0, 0, 1]);
    expect(fill.colorStops).toHaveLength(2);
    expect(fill.colorStops[0].color).toBe('rgba(11, 11, 11, 0.25)');
    expect(fill.colorStops[1].color).toBe('rgba(11, 11, 11, 0)');
    expect(lineOpt().series[0].areaStyle).toBeUndefined();
  });

  it('stacks the series, fills them, and sizes the axis to the total', () => {
    const opt = lineOpt({ stacked: true });
    expect(main(opt).map((s: Opt) => s.stack)).toEqual(['total', 'total']);
    expect(main(opt).every((s: Opt) => s.areaStyle?.color?.type === 'linear')).toBe(true);
    // 40 + 8 = 48 is the tallest stack, taller than the tallest series.
    expect(opt.yAxis.max).toBeGreaterThanOrEqual(48);
    expect(lineOpt().yAxis.max).toBeLessThan(opt.yAxis.max);
  });

  it('turns animation off for reduced motion', () => {
    expect(lineOpt().animation).toBe(true);
    expect(lineOpt({}, { ...theme, reducedMotion: true }).animation).toBe(false);
  });

  it('adds decals, symbols and dashes in high contrast, and none of them otherwise', () => {
    const normal = lineOpt({}, theme);
    expect(normal.aria.decal.show).toBe(false);
    expect(main(normal).every((s: Opt) => s.showSymbol === false && s.lineStyle.type === 'solid')).toBe(true);

    const rows = [row('s0', 'A', 1, [1, 2, 3, 4]), row('s1', 'B', 2, [2, 3, 4, 5], true)];
    const hc = lineOpt({ rows }, contrastTheme);
    expect(hc.aria.enabled).toBe(true);
    expect(hc.aria.decal.show).toBe(true);
    expect(hc.aria.decal.decals.length).toBeGreaterThanOrEqual(6);
    expect(hc.series.map((s: Opt) => s.showSymbol)).toEqual([true, true]);
    expect(hc.series.map((s: Opt) => s.symbol)).toEqual(['circle', 'rect']);
    expect(hc.series.map((s: Opt) => s.lineStyle.type)).toEqual(['solid', 'dashed']);
  });

  it('draws a point with no neighbour as a lone dot, since a line cannot show it', () => {
    const lonely = row('s0', 'Spend', 1, [1, null, 3, null, null, 6]);
    expect(lonePoints(lonely.values)).toEqual([true, false, true, false, false, true]);
    const opt = lineOpt({ labels: ['a', 'b', 'c', 'd', 'e', 'f'], rows: [lonely] });
    expect(opt.series).toHaveLength(2);
    expect(opt.series[1].data).toEqual([1, null, 3, null, null, 6]);
    expect(opt.series[1].tooltip.show).toBe(false);
    expect(lineOpt({ rows: [input] }).series).toHaveLength(1);
  });
});

describe('line tooltip', () => {
  const build = (over: Partial<Parameters<typeof lineOption>[0]> = {}) => lineOpt(over);

  it('lists every visible series with swatch, name and formatted value, largest first', () => {
    const html: string = build({ tip: (n) => `${n} tok` }).tooltip.formatter([{ dataIndex: 0 }]);
    expect(html).toContain('Mon');
    const names = [...html.matchAll(/upmo-chart__tip-name">([^<]*)</g)].map((m) => m[1]);
    const values = [...html.matchAll(/upmo-chart__tip-value">([^<]*)</g)].map((m) => m[1]);
    expect(names).toEqual(['Input', 'Output']);
    expect(values).toEqual(['10 tok', '5 tok']);
    const swatches = [...html.matchAll(/background:([^"]+)"/g)].map((m) => m[1]);
    expect(swatches).toEqual([colors['--chart-1'], colors['--chart-2']]);
  });

  it('sorts by value, with a missing value last', () => {
    const rows = lineTipRows([output, input], 1, theme, identity);
    expect(rows.map((r) => [r.name, r.value])).toEqual([
      ['Input', '20'],
      ['Output', 'No data'],
    ]);
    expect(rows[1].muted).toBe(true);
    expect(sortTipRows([{ value: null }, { value: 3 }, { value: 9 }]).map((r) => r.value)).toEqual([9, 3, null]);
  });

  it('prefers a point display over the formatter', () => {
    const shown = { ...input, displays: ['ten', undefined, undefined, undefined] };
    expect(lineTipRows([shown], 0, theme, (n) => `${n}!`)[0].value).toBe('ten');
    expect(lineTipRows([shown], 1, theme, (n) => `${n}!`)[0].value).toBe('20!');
  });

  it('escapes names and values', () => {
    const html = tipHtml('<b>x</b>', [{ color: 'red', name: 'A&B', value: '<1>' }]);
    expect(html).not.toContain('<b>');
    expect(html).toContain('A&amp;B');
    expect(html).toContain('&lt;1&gt;');
  });

  it('returns nothing for an index out of range', () => {
    expect(build().tooltip.formatter([{ dataIndex: 9 }])).toBe('');
    expect(build().tooltip.formatter([])).toBe('');
  });
});

describe('stack maths', () => {
  it('adds series bottom to top, treating a null as nothing', () => {
    expect(stackTops([input, output], 4)).toEqual([
      [10, 20, 30, 40],
      [15, 20, 37, 48],
    ]);
    expect(lineScale({ rows: [input, output], stacked: true, labels }).max).toBeGreaterThanOrEqual(48);
    expect(lineScale({ rows: [input, output], stacked: false, labels }).max).toBeLessThan(60);
  });
});

describe('groupedBarOption', () => {
  const bars: BarRow[] = [
    { key: 'b0', name: 'Passed', color: 'var(--chart-1)', values: [30, 42, 25], displays: [undefined, undefined, '25 runs'] },
    { key: 'b1', name: 'Failed', color: 'var(--chart-2)', values: [4, null, 0], displays: [undefined, undefined, undefined] },
  ];
  const args = { labels: ['Mon', 'Tue', 'Wed'], bars, horizontal: false, tick: identity, tip: identity };

  it('draws rounded-top bars capped at 28px in token colours, with a null left as a gap', () => {
    const opt: Opt = groupedBarOption(args, theme);
    expect(opt.series.map((s: Opt) => s.type)).toEqual(['bar', 'bar']);
    expect(opt.series[0].itemStyle.borderRadius).toEqual([3, 3, 0, 0]);
    expect(opt.series[0].barMaxWidth).toBe(28);
    expect(opt.series[0].itemStyle.color).toBe(colors['--chart-1']);
    expect(opt.series[1].data).toEqual([4, null, 0]);
    expect(opt.xAxis.type).toBe('category');
    expect(opt.yAxis.type).toBe('value');
  });

  it('swaps the axes and rounds the free end for horizontal bars', () => {
    const opt: Opt = groupedBarOption({ ...args, horizontal: true }, theme);
    expect(opt.xAxis.type).toBe('value');
    expect(opt.yAxis.type).toBe('category');
    expect(opt.yAxis.inverse).toBe(true);
    expect(opt.series[0].itemStyle.borderRadius).toEqual([0, 3, 3, 0]);
  });

  it('lists every bar of the group in the tooltip, largest first, with No data for a null', () => {
    const opt: Opt = groupedBarOption(args, theme);
    const html: string = opt.tooltip.formatter([{ dataIndex: 1 }]);
    expect([...html.matchAll(/tip-name">([^<]*)</g)].map((m) => m[1])).toEqual(['Passed', 'Failed']);
    expect([...html.matchAll(/tip-value">([^<]*)</g)].map((m) => m[1])).toEqual(['42', 'No data']);
    expect(barTipRows(bars, 2, theme, identity)[0].value).toBe('25 runs');
  });
});

describe('comboOption', () => {
  const combo = (over: Record<string, unknown> = {}) =>
    comboOption(
      {
        labels,
        bars: { name: 'Runs', color: 'var(--chart-1)', values: [30, null, 50, 80], displays: [] },
        line: { name: 'Success rate', color: 'var(--chart-2)', values: [90, 95, null, 99], displays: [] },
        showBars: true,
        showLine: true,
        tickBar: (n: number) => `${n} runs`,
        tickLine: (n: number) => `${n}%`,
        tipBar: (n: number) => `${n} runs`,
        tipLine: (n: number) => `${n}%`,
        ...over,
      },
      theme,
    ) as Opt;

  it('draws bars on the left axis and a smooth line on the right axis', () => {
    const opt = combo();
    expect(main(opt).map((s: Opt) => [s.type, s.yAxisIndex])).toEqual([
      ['bar', 0],
      ['line', 1],
    ]);
    expect(main(opt)[1].smooth).toBe(true);
    expect(opt.series[1].data).toEqual([90, 95, null, 99]);
    expect(opt.yAxis).toHaveLength(2);
  });

  it('gives both axes the same number of ticks so the gridlines line up', () => {
    const opt = combo();
    const count = (axis: Opt) => Math.round((axis.max - axis.min) / axis.interval) + 1;
    expect(count(opt.yAxis[0])).toBeGreaterThanOrEqual(4);
    expect(count(opt.yAxis[0])).toBeLessThanOrEqual(5);
    expect(count(opt.yAxis[1])).toBe(count(opt.yAxis[0]));
    const { left, right } = comboScales([30, 50, 80], [90, 95, 99]);
    expect(right.ticks).toHaveLength(left.ticks.length);
  });

  it('names each axis by its series and formats its ticks', () => {
    const opt = combo();
    expect(opt.yAxis.map((a: Opt) => a.name)).toEqual(['Runs', 'Success rate']);
    expect(opt.yAxis[0].axisLabel.formatter(500)).toBe('500 runs');
    expect(opt.yAxis[1].axisLabel.formatter(95)).toBe('95%');
  });

  it('leaves out a hidden series and its axis', () => {
    const noBars = combo({ showBars: false });
    expect(main(noBars).map((s: Opt) => s.type)).toEqual(['line']);
    expect(noBars.yAxis[0].show).toBe(false);
    expect(noBars.yAxis[1].splitLine.show).toBe(true);
    const noLine = combo({ showLine: false });
    expect(main(noLine).map((s: Opt) => s.type)).toEqual(['bar']);
    expect(noLine.yAxis[1].show).toBe(false);
  });

  it('shows both values in the tooltip, bars first', () => {
    const html: string = combo().tooltip.formatter([{ dataIndex: 3 }]);
    expect([...html.matchAll(/tip-value">([^<]*)</g)].map((m) => m[1])).toEqual(['80 runs', '99%']);
    const gap: string = combo().tooltip.formatter([{ dataIndex: 1 }]);
    expect([...gap.matchAll(/tip-value">([^<]*)</g)].map((m) => m[1])).toEqual(['No data', '95%']);
  });
});

describe('donutOption', () => {
  const args = {
    slices: [
      { key: 'd0', label: 'Claude', amount: 60, color: 'var(--chart-1)' },
      { key: 'other', label: 'Other', amount: 40, color: 'var(--chart-mid)' },
    ],
    displays: ['60 runs', '40'],
    shares: ['60%', '40%'],
  };

  it('draws a ring with the slice labels off, a quiet emphasis and token colours', () => {
    const opt = donutOption(args, theme) as Opt;
    const pie = opt.series[0];
    expect(pie.type).toBe('pie');
    expect(Array.isArray(pie.radius)).toBe(true);
    expect(pie.label.show).toBe(false);
    expect(pie.labelLine.show).toBe(false);
    expect(pie.emphasis.scaleSize).toBeLessThanOrEqual(6);
    expect(pie.data.map((d: Opt) => d.itemStyle.color)).toEqual([colors['--chart-1'], colors['--chart-mid']]);
    expect(pie.data.map((d: Opt) => d.value)).toEqual([60, 40]);
    expect(pie.itemStyle.borderColor).toBe(theme.surface);
  });

  it('shows the label, value and share in the tooltip', () => {
    const html: string = (donutOption(args, theme) as Opt).tooltip.formatter({ dataIndex: 0 });
    expect(html).toContain('Claude');
    expect(html).toContain('60 runs');
    expect(html).toContain('60%');
  });

  it('adds decals in high contrast', () => {
    expect((donutOption(args, contrastTheme) as Opt).aria.decal.show).toBe(true);
    expect((donutOption(args, theme) as Opt).aria.decal.show).toBe(false);
  });
});

describe('keyboard navigation plans', () => {
  it('shows the tooltip on the first series that has a value, and highlights every series with one', () => {
    expect(axisNavPlan([input, output], 0)).toEqual({
      tip: { type: 'showTip', seriesIndex: 0, dataIndex: 0 },
      highlight: { type: 'highlight', seriesId: ['s0', 's1'], dataIndex: 0 },
    });
    expect(axisNavPlan([input, output], 1).highlight).toEqual({ type: 'highlight', seriesId: ['s0'], dataIndex: 1 });
    expect(axisNavPlan([output], 1)).toEqual({ tip: null, highlight: null });
  });

  it('points at a slice by index', () => {
    expect(sliceNavPlan(2)).toEqual({
      tip: { type: 'showTip', seriesIndex: 0, dataIndex: 2 },
      highlight: { type: 'highlight', seriesIndex: 0, dataIndex: 2 },
    });
  });
});
