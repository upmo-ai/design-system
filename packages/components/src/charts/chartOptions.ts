/**
 * ECharts option builders for the four multi-series charts. Pure functions of
 * the resolved chart data and a ChartTheme, so tests assert on the option
 * without drawing anything. They import ECharts types only (erased at build);
 * the library itself is loaded lazily by EChartFrame.
 *
 * Look, shared by all four: no symbols until hover or focus, a floating tooltip
 * with an axis pointer, light split lines, muted compact axis labels, rounded
 * bar tops and a quiet emphasis. Colour is never the only cue in high contrast:
 * decals, symbols and dashes switch on there.
 */
import { alignedScale, niceScale, type Cell, type Curve, type Scale, type SeriesStyle } from './chartKit.ts';
import { escapeHtml } from './chartFormat.ts';
import { paint, withAlpha, type ChartTheme } from './chartTheme.ts';
import type { EChartsCoreOption } from './echartsSetup.ts';

type Obj = Record<string, unknown>;

/** An ECharts dispatchAction payload. */
export type Action = { type: string } & Obj;

/** What the frame does for the keyboard-focused position: show its tooltip and highlight it. */
export interface NavPlan {
  tip: Action | null;
  highlight: Action | null;
}

// --- Tooltip ---------------------------------------------------------------------

export interface TipRow {
  /** A resolved colour string. */
  color: string;
  name: string;
  value: string;
  /** Rendered quieter, for a missing value. */
  muted?: boolean;
}

/** The tooltip body: an optional title, then one row per series with a round swatch, name and value. */
export function tipHtml(title: string | null, rows: readonly TipRow[]): string {
  const head = title === null ? '' : `<div class="upmo-chart__tip-title">${escapeHtml(title)}</div>`;
  const body = rows
    .map(
      (r) =>
        `<div class="upmo-chart__tip-row${r.muted ? ' upmo-chart__tip-row--muted' : ''}">` +
        `<span class="upmo-chart__tip-swatch" style="background:${escapeHtml(r.color)}"></span>` +
        `<span class="upmo-chart__tip-name">${escapeHtml(r.name)}</span>` +
        `<span class="upmo-chart__tip-value">${escapeHtml(r.value)}</span>` +
        `</div>`,
    )
    .join('');
  return `<div class="upmo-chart__tip">${head}${body}</div>`;
}

/** Rows ordered by value, largest first; a missing value goes last. */
export function sortTipRows<T extends { value: Cell }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.value === null && b.value === null) return 0;
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    return b.value - a.value;
  });
}

function tooltipBase(theme: ChartTheme): Obj {
  return {
    confine: true,
    className: 'upmo-chart__tooltip',
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    padding: 0,
    textStyle: { color: theme.ink, fontFamily: theme.fontFamily, fontSize: theme.bodySize },
    extraCssText: 'box-shadow: var(--shadow-sm); border-radius: var(--radius-sm);',
    transitionDuration: theme.reducedMotion ? 0 : 0.12,
    hideDelay: 80,
  };
}

// --- Shared pieces -----------------------------------------------------------------

/** Six fill textures for high contrast, drawn over each series colour in the page ground colour. */
function decals(theme: ChartTheme): Obj[] {
  const color = withAlpha(theme.surface, 0.85);
  return [
    { symbol: 'rect', dashArrayX: [1, 0], dashArrayY: [2, 5], rotation: Math.PI / 6, color },
    { symbol: 'circle', symbolSize: 1.2, dashArrayX: [[6, 6], [0, 6, 6, 0]], dashArrayY: [6, 0], color },
    { symbol: 'rect', dashArrayX: [1, 0], dashArrayY: [4, 3], rotation: -Math.PI / 4, color },
    { symbol: 'rect', dashArrayX: [[1, 0], [1, 6]], dashArrayY: [1, 0, 6, 0], rotation: Math.PI / 4, color },
    { symbol: 'triangle', symbolSize: 1.2, dashArrayX: [[9, 9], [0, 9, 9, 0]], dashArrayY: [7, 2], color },
    { symbol: 'rect', dashArrayX: [1, 0], dashArrayY: [2, 3], color },
  ];
}

function base(theme: ChartTheme): Obj {
  return {
    animation: !theme.reducedMotion,
    animationDuration: 420,
    animationDurationUpdate: 240,
    textStyle: { color: theme.ink, fontFamily: theme.fontFamily, fontSize: theme.fontSize },
    aria: {
      enabled: theme.contrast,
      label: { enabled: false },
      decal: { show: theme.contrast, decals: decals(theme) },
    },
  };
}

const grid = (extra: Obj = {}): Obj => ({ top: 12, right: 16, bottom: 4, left: 4, containLabel: true, ...extra });

function categoryAxis(theme: ChartTheme, labels: readonly string[], extra: Obj = {}, labelExtra: Obj = {}): Obj {
  return {
    type: 'category',
    data: [...labels],
    axisLine: { lineStyle: { color: theme.borderStrong } },
    axisTick: { show: false },
    axisLabel: {
      color: theme.inkMuted,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      margin: 10,
      hideOverlap: true,
      ...labelExtra,
    },
    ...extra,
  };
}

function valueAxis(theme: ChartTheme, scale: Scale, tick: (n: number) => string, extra: Obj = {}, grid = true): Obj {
  return {
    type: 'value',
    min: scale.min,
    max: scale.max,
    interval: scale.step,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: theme.inkMuted,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      margin: 8,
      formatter: (value: number) => tick(value),
    },
    splitLine: { show: grid, lineStyle: { color: theme.border, opacity: theme.contrast ? 1 : 0.7 } },
    ...extra,
  };
}

const finite = (cells: readonly Cell[]) => cells.filter((v): v is number => v !== null);

/** The symbol name ECharts uses for a marker shape. */
const SYMBOL: Record<SeriesStyle['marker'], string> = {
  circle: 'circle',
  square: 'rect',
  triangle: 'triangle',
  diamond: 'diamond',
};

/** Positions with a value whose neighbours both have none: a run of one, which a line cannot draw. */
export function lonePoints(values: readonly Cell[]): boolean[] {
  return values.map((v, i) => v !== null && values[i - 1] == null && values[i + 1] == null);
}

function areaGradient(color: string, top: number, bottom: number): Obj {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: withAlpha(color, top) },
      { offset: 1, color: withAlpha(color, bottom) },
    ],
  };
}

/**
 * A silent line series that draws only the isolated points of another, so a value
 * with no neighbour is never invisible. Null elsewhere.
 */
function loneSeries(id: string, name: string, color: string, theme: ChartTheme, data: Cell[], yAxisIndex?: number): Obj {
  return {
    id: `${id}-lone`,
    name,
    type: 'line',
    silent: true,
    tooltip: { show: false },
    yAxisIndex,
    showSymbol: true,
    symbol: 'circle',
    symbolSize: 7,
    lineStyle: { width: 0, opacity: 0 },
    itemStyle: { color, borderColor: theme.surface, borderWidth: 1.5 },
    connectNulls: false,
    z: 4,
    data,
  };
}

// --- Line chart --------------------------------------------------------------------

export interface LineRow {
  /** Stable id for legend highlight. */
  key: string;
  name: string;
  /** A `var(--chart-N)` reference. */
  color: string;
  values: Cell[];
  displays: (string | undefined)[];
  style: SeriesStyle;
}

export interface LineArgs {
  labels: string[];
  /** Only the visible series, in drawing order. */
  rows: LineRow[];
  stacked: boolean;
  area: boolean;
  curve: Curve;
  tick: (n: number) => string;
  tip: (n: number) => string;
}

/** The running totals of stacked series: a null adds nothing, a negative adds nothing. */
export function stackTops(rows: readonly { values: Cell[] }[], n: number): number[][] {
  let below: number[] = new Array<number>(n).fill(0);
  return rows.map((row) => {
    below = below.map((b, i) => {
      const v = row.values[i];
      return v === null ? b : b + Math.max(0, v);
    });
    return below;
  });
}

export function lineScale(args: Pick<LineArgs, 'rows' | 'stacked' | 'labels'>): Scale {
  const plotted = args.stacked
    ? stackTops(args.rows, args.labels.length).flat()
    : args.rows.flatMap((r) => finite(r.values));
  return niceScale(Math.min(0, ...plotted), Math.max(0, ...plotted));
}

export function lineOption(args: LineArgs, theme: ChartTheme): EChartsCoreOption {
  const { labels, rows, stacked, area, curve, tick, tip } = args;
  const n = labels.length;
  const scale = lineScale(args);
  const tops = stacked ? stackTops(rows, n) : [];
  const smooth = curve === 'smooth';

  const series: Obj[] = rows.map((row) => {
    const color = paint(theme, row.color);
    const filled = stacked || area;
    return {
      id: row.key,
      name: row.name,
      type: 'line',
      smooth,
      smoothMonotone: 'x',
      connectNulls: false,
      stack: stacked ? 'total' : undefined,
      data: stacked ? row.values.map((v) => (v === null ? null : Math.max(0, v))) : row.values,
      showSymbol: theme.contrast,
      symbol: theme.contrast ? SYMBOL[row.style.marker] : 'circle',
      symbolSize: theme.contrast ? 7 : 8,
      lineStyle: { width: 2, color, type: theme.contrast && row.style.dashed ? 'dashed' : 'solid' },
      itemStyle: { color, borderColor: theme.surface, borderWidth: 1.5 },
      areaStyle: filled ? { color: areaGradient(color, stacked ? 0.4 : 0.25, stacked ? 0.08 : 0) } : undefined,
      emphasis: { focus: 'series', lineStyle: { width: 2.5 }, areaStyle: { opacity: 1 } },
      blur: { lineStyle: { opacity: 0.3 }, areaStyle: { opacity: 0.3 }, itemStyle: { opacity: 0.3 } },
      z: 3,
    };
  });

  if (!theme.contrast) {
    rows.forEach((row, pos) => {
      const lone = lonePoints(row.values);
      if (!lone.some(Boolean)) return;
      const data = row.values.map((v, i) => (lone[i] ? (stacked ? tops[pos][i] : v) : null));
      series.push(loneSeries(row.key, row.name, paint(theme, row.color), theme, data));
    });
  }

  return {
    ...base(theme),
    grid: grid(),
    xAxis: categoryAxis(theme, labels, { boundaryGap: n === 1 }),
    yAxis: valueAxis(theme, scale, tick),
    tooltip: {
      ...tooltipBase(theme),
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: theme.borderStrong, width: 1, type: 'solid' }, z: 1 },
      formatter: (params: unknown) => {
        const first = Array.isArray(params) ? params[0] : params;
        const i = (first as { dataIndex?: number } | undefined)?.dataIndex;
        if (typeof i !== 'number' || i < 0 || i >= n) return '';
        return tipHtml(labels[i], lineTipRows(rows, i, theme, tip));
      },
    },
    series,
  };
}

/** The tooltip rows for one x position: every visible series, largest value first. */
export function lineTipRows(
  rows: readonly LineRow[],
  index: number,
  theme: ChartTheme,
  tip: (n: number) => string,
): TipRow[] {
  return sortTipRows(
    rows.map((row) => ({ row, value: row.values[index] ?? null })),
  ).map(({ row, value }) => ({
    color: paint(theme, row.color),
    name: row.name,
    value: value === null ? 'No data' : (row.displays[index] ?? tip(value)),
    muted: value === null,
  }));
}

// --- Keyboard navigation ----------------------------------------------------------------

/**
 * The tooltip and highlight actions for position `index` of an axis chart. The tip
 * needs a series that has a value there (a gap has no point to anchor to).
 */
export function axisNavPlan(
  series: readonly { key: string; values: readonly Cell[] }[],
  index: number,
): NavPlan {
  const withValue = series.map((s, i) => ({ s, i })).filter(({ s }) => s.values[index] != null);
  if (withValue.length === 0) return { tip: null, highlight: null };
  return {
    tip: { type: 'showTip', seriesIndex: withValue[0].i, dataIndex: index },
    highlight: { type: 'highlight', seriesId: withValue.map(({ s }) => s.key), dataIndex: index },
  };
}

export function sliceNavPlan(index: number): NavPlan {
  return {
    tip: { type: 'showTip', seriesIndex: 0, dataIndex: index },
    highlight: { type: 'highlight', seriesIndex: 0, dataIndex: index },
  };
}

// --- Grouped bar chart ----------------------------------------------------------------

export interface BarRow {
  key: string;
  name: string;
  color: string;
  values: Cell[];
  displays: (string | undefined)[];
}

export interface GroupedBarArgs {
  labels: string[];
  bars: BarRow[];
  horizontal: boolean;
  tick: (n: number) => string;
  tip: (n: number) => string;
}

export function barScale(bars: readonly { values: Cell[] }[]): Scale {
  const nums = bars.flatMap((b) => finite(b.values));
  return niceScale(Math.min(0, ...nums), Math.max(0, ...nums));
}

const BAR_MAX_WIDTH = 28;
const BAR_RADIUS = 3;

function barSeries(row: BarRow, theme: ChartTheme, horizontal: boolean, extra: Obj = {}): Obj {
  const color = paint(theme, row.color);
  return {
    id: row.key,
    name: row.name,
    type: 'bar',
    data: row.values,
    barMaxWidth: BAR_MAX_WIDTH,
    itemStyle: {
      color,
      borderRadius: horizontal ? [0, BAR_RADIUS, BAR_RADIUS, 0] : [BAR_RADIUS, BAR_RADIUS, 0, 0],
    },
    emphasis: { focus: 'series' },
    blur: { itemStyle: { opacity: 0.35 } },
    ...extra,
  };
}

function shadowPointer(theme: ChartTheme): Obj {
  return { type: 'shadow', shadowStyle: { color: withAlpha(theme.inkMuted, 0.12) }, z: 1 };
}

export function groupedBarOption(args: GroupedBarArgs, theme: ChartTheme): EChartsCoreOption {
  const { labels, bars, horizontal, tick, tip } = args;
  const scale = barScale(bars);
  const valueAxisConfig = valueAxis(theme, scale, tick);
  const categoryConfig = horizontal
    ? categoryAxis(
        theme,
        labels,
        { inverse: true, axisLine: { show: false } },
        { width: 120, overflow: 'truncate', margin: 8 },
      )
    : categoryAxis(theme, labels);

  return {
    ...base(theme),
    grid: grid(),
    xAxis: horizontal ? valueAxisConfig : categoryConfig,
    yAxis: horizontal ? categoryConfig : valueAxisConfig,
    tooltip: {
      ...tooltipBase(theme),
      trigger: 'axis',
      axisPointer: shadowPointer(theme),
      formatter: (params: unknown) => {
        const first = Array.isArray(params) ? params[0] : params;
        const i = (first as { dataIndex?: number } | undefined)?.dataIndex;
        if (typeof i !== 'number' || i < 0 || i >= labels.length) return '';
        return tipHtml(labels[i], barTipRows(bars, i, theme, tip));
      },
    },
    series: bars.map((row) => barSeries(row, theme, horizontal, { barGap: '12%', barCategoryGap: '38%' })),
  };
}

export function barTipRows(
  bars: readonly BarRow[],
  index: number,
  theme: ChartTheme,
  tip: (n: number) => string,
): TipRow[] {
  return sortTipRows(bars.map((bar) => ({ bar, value: bar.values[index] ?? null }))).map(({ bar, value }) => ({
    color: paint(theme, bar.color),
    name: bar.name,
    value: value === null ? 'No data' : (bar.displays[index] ?? tip(value)),
    muted: value === null,
  }));
}

// --- Combo chart -----------------------------------------------------------------------------

export interface ComboArgs {
  labels: string[];
  /** Both are always passed; `showBars` and `showLine` say which are drawn. */
  bars: { name: string; color: string; values: Cell[]; displays: (string | undefined)[] };
  line: { name: string; color: string; values: Cell[]; displays: (string | undefined)[] };
  showBars: boolean;
  showLine: boolean;
  tickBar: (n: number) => string;
  tickLine: (n: number) => string;
  tipBar: (n: number) => string;
  tipLine: (n: number) => string;
}

export const COMBO_BARS_KEY = 'bars';
export const COMBO_LINE_KEY = 'line';

/** Two scales that share a gridline count: the left from the bars, the right pinned to the same number of ticks. */
export function comboScales(bars: readonly Cell[], line: readonly Cell[]): { left: Scale; right: Scale } {
  const b = finite(bars);
  const l = finite(line);
  const left = niceScale(Math.min(0, ...b), Math.max(0, ...b));
  const right = alignedScale(Math.min(0, ...l), Math.max(0, ...l), left.ticks.length);
  return { left, right };
}

export function comboOption(args: ComboArgs, theme: ChartTheme): EChartsCoreOption {
  const { labels, bars, line, showBars, showLine } = args;
  const { left, right } = comboScales(bars.values, line.values);
  const barColor = paint(theme, bars.color);
  const lineColor = paint(theme, line.color);

  const axisName = (name: string, align: 'left' | 'right'): Obj => ({
    name,
    nameLocation: 'end',
    nameGap: 12,
    nameTruncate: { maxWidth: 160, ellipsis: '\u2026' },
    nameTextStyle: { color: theme.inkMuted, fontFamily: theme.fontFamily, fontSize: theme.fontSize, align },
  });

  const series: Obj[] = [];
  if (showBars) {
    series.push(
      barSeries(
        { key: COMBO_BARS_KEY, name: bars.name, color: bars.color, values: bars.values, displays: bars.displays },
        theme,
        false,
        { yAxisIndex: 0 },
      ),
    );
  }
  if (showLine) {
    series.push({
      id: COMBO_LINE_KEY,
      name: line.name,
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      smoothMonotone: 'x',
      connectNulls: false,
      data: line.values,
      showSymbol: theme.contrast,
      symbol: 'circle',
      symbolSize: theme.contrast ? 7 : 8,
      lineStyle: { width: 2, color: lineColor },
      itemStyle: { color: lineColor, borderColor: theme.surface, borderWidth: 1.5 },
      emphasis: { focus: 'series', lineStyle: { width: 2.5 } },
      blur: { lineStyle: { opacity: 0.3 }, itemStyle: { opacity: 0.3 } },
      z: 3,
    });
    const lone = lonePoints(line.values);
    if (!theme.contrast && lone.some(Boolean)) {
      series.push(
        loneSeries(
          COMBO_LINE_KEY,
          line.name,
          lineColor,
          theme,
          line.values.map((v, i) => (lone[i] ? v : null)),
          1,
        ),
      );
    }
  }

  const rowsAt = (i: number): TipRow[] => {
    const rows: { value: Cell; row: TipRow }[] = [];
    if (showBars) {
      const v = bars.values[i] ?? null;
      rows.push({
        value: v,
        row: {
          color: barColor,
          name: bars.name,
          value: v === null ? 'No data' : (bars.displays[i] ?? args.tipBar(v)),
          muted: v === null,
        },
      });
    }
    if (showLine) {
      const v = line.values[i] ?? null;
      rows.push({
        value: v,
        row: {
          color: lineColor,
          name: line.name,
          value: v === null ? 'No data' : (line.displays[i] ?? args.tipLine(v)),
          muted: v === null,
        },
      });
    }
    // Two different units: keep bars first, as the axes read, rather than ranking by value.
    return rows.map((r) => r.row);
  };

  return {
    ...base(theme),
    grid: grid({ top: 32, right: 16 }),
    xAxis: categoryAxis(theme, labels),
    yAxis: [
      valueAxis(theme, left, args.tickBar, { show: showBars, ...axisName(bars.name, 'left') }),
      // The right axis draws the gridlines only when the left one is hidden, so a chart keeps its rules.
      valueAxis(theme, right, args.tickLine, { show: showLine, ...axisName(line.name, 'right') }, !showBars),
    ],
    tooltip: {
      ...tooltipBase(theme),
      trigger: 'axis',
      axisPointer: shadowPointer(theme),
      formatter: (params: unknown) => {
        const first = Array.isArray(params) ? params[0] : params;
        const i = (first as { dataIndex?: number } | undefined)?.dataIndex;
        if (typeof i !== 'number' || i < 0 || i >= labels.length) return '';
        return tipHtml(labels[i], rowsAt(i));
      },
    },
    series,
  };
}

// --- Donut chart ---------------------------------------------------------------------------------

export interface DonutSlice {
  key: string;
  label: string;
  amount: number;
  /** A `var(--chart-N)` reference. */
  color: string;
}

export interface DonutArgs {
  /** The visible slices, in drawing order. */
  slices: DonutSlice[];
  /** The value text of each slice (its `display` or the formatted amount). */
  displays: string[];
  /** The rounded share of each slice. */
  shares: string[];
}

export function donutOption(args: DonutArgs, theme: ChartTheme): EChartsCoreOption {
  const { slices, displays, shares } = args;
  return {
    ...base(theme),
    tooltip: {
      ...tooltipBase(theme),
      trigger: 'item',
      formatter: (params: unknown) => {
        const i = (params as { dataIndex?: number } | undefined)?.dataIndex;
        if (typeof i !== 'number' || !slices[i]) return '';
        return tipHtml(slices[i].label, [
          { color: paint(theme, slices[i].color), name: shares[i], value: displays[i] },
        ]);
      },
    },
    series: [
      {
        id: 'ring',
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['62%', '92%'],
        startAngle: 90,
        clockwise: true,
        avoidLabelOverlap: false,
        selectedMode: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: theme.surface, borderWidth: 2, borderRadius: 3 },
        emphasis: { scale: true, scaleSize: 4, label: { show: false } },
        data: slices.map((s) => ({
          name: s.label,
          value: s.amount,
          itemStyle: { color: paint(theme, s.color) },
        })),
      },
    ],
  };
}
