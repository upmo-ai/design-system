import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { MAX_GROUP_BARS, colorVar, sumCells, toCell, type Cell } from './chartKit.ts';
import { tickFormatter, tooltipFormatter } from './chartFormat.ts';
import { axisNavPlan, groupedBarOption, type BarRow } from './chartOptions.ts';
import {
  ChartDataTable,
  ChartLegend,
  ChartReadout,
  EmptyChart,
  useChartNav,
  useFormatter,
  useHiddenSeries,
  useKeyed,
  useLegendHover,
} from './chartParts.tsx';
import type { ChartTheme } from './chartTheme.ts';
import { EChartFrame } from './EChartFrame.tsx';
import type { ECharts } from './echartsSetup.ts';

export interface GroupedBarDatum {
  name: string;
  /** null skips the bar; it is never drawn as zero. */
  value: number | null;
  /** Optional pre-formatted value for the readout and data table. Defaults to formatValue. */
  display?: string;
}

export interface BarGroup {
  label: string;
  /** The same bars, in the same order, in every group; names come from the first group. */
  bars: GroupedBarDatum[];
}

export interface GroupedBarChartProps {
  /**
   * The groups. Bars use chart-1 to chart-3 by position. Past the third bar, the
   * rest are summed into one "Other" bar in chart-mid.
   */
  groups: BarGroup[];
  /** Default 'vertical'. */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible title for the chart. */
  title?: string;
  /** Chart height in px. Default 220 vertical; horizontal grows with the number of groups. */
  height?: number;
  /** Width in px used only while the container has no measurable width. The chart otherwise follows its container. Default 480. */
  width?: number;
  /** Formats axis ticks, the tooltip and values that have no `display`. Without it, axis ticks use a compact form (536k, 2.3M). */
  formatValue?: (n: number) => string;
  /** Name of the merged bar. Default "Other". */
  otherLabel?: string;
  /** Text shown when there is nothing to plot. Default "No data to show". */
  emptyText?: string;
  className?: string;
}

/**
 * A grouped bar chart drawn with ECharts (loaded lazily on first use), vertical or
 * horizontal, with rounded bar tops, a value axis, a hover tooltip, and a clickable
 * legend that hides and shows bars. Focus the chart and use the arrow keys to move
 * between groups; a readout line names the group and its values. In high contrast
 * the bars gain fill patterns. The drawing is hidden from assistive tech; a visually
 * hidden table (caption = title) carries every value.
 */
export function GroupedBarChart({
  groups,
  orientation = 'vertical',
  title,
  height,
  width = 480,
  formatValue,
  otherLabel = 'Other',
  emptyText = 'No data to show',
  className,
}: GroupedBarChartProps) {
  const label = title ?? 'Grouped bar chart';
  const { fmt, given, signature } = useFormatter(formatValue);
  const chartRef = useRef<ECharts | null>(null);
  const horizontal = orientation === 'horizontal';

  const source = groups[0]?.bars ?? [];
  const barCount = source.length;
  const n = groups.length;

  // Resolve the bars a group draws: the first three as given, the rest as "Other".
  const folded = barCount > MAX_GROUP_BARS;
  const k = folded ? MAX_GROUP_BARS + 1 : barCount;
  const dataKey = JSON.stringify([groups, otherLabel]);
  const labels = useKeyed(groups.map((g) => g.label), dataKey);
  const bars = useKeyed<BarRow[]>(
    Array.from({ length: k }, (_, j) => {
      const isOther = folded && j === MAX_GROUP_BARS;
      const cell = (g: number): Cell =>
        isOther
          ? sumCells(groups[g].bars.slice(MAX_GROUP_BARS).map((b) => toCell(b.value)))
          : toCell(groups[g].bars[j]?.value);
      return {
        key: `b${j}`,
        name: isOther ? otherLabel : source[j].name,
        color: isOther ? colorVar('mid') : colorVar((j + 1) as 1 | 2 | 3),
        values: groups.map((_, g) => cell(g)),
        displays: groups.map((g) => (isOther ? undefined : g.bars[j]?.display)),
      };
    }),
    dataKey,
  );

  const [hidden, toggle] = useHiddenSeries(bars.map((b) => b.name).join('\u0000'), bars.length);
  const visible = useKeyed(bars.filter((_, i) => !hidden.has(i)), `${dataKey}|${[...hidden].join(',')}`);

  const nav = useChartNav(n);
  const tick = useKeyed(tickFormatter(given ? fmt : undefined), String(given));
  const tip = useKeyed(tooltipFormatter(given ? fmt : undefined), String(given));

  const optionKey = [dataKey, [...hidden].join(','), horizontal, signature].join('|');
  const build = useCallback(
    (theme: ChartTheme) => groupedBarOption({ labels, bars: visible, horizontal, tick, tip }, theme),
    // The key stands for the content of labels, visible, tick and tip.
    [optionKey],
  );
  const navPlan = useCallback((i: number) => axisNavPlan(visible, i), [visible]);
  const legendTarget = useCallback((i: number) => (hidden.has(i) ? null : { seriesId: bars[i].key }), [hidden, bars]);
  const hover = useLegendHover(chartRef, legendTarget);

  if (n === 0 || barCount === 0) {
    return (
      <figure className={clsx('upmo-grouped-bar', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  const h = height ?? (horizontal ? Math.max(140, n * (k * 14 + 14) + 36) : 220);

  const readout =
    nav.active === null
      ? null
      : {
          label: labels[nav.active],
          items: visible.map((b) => {
            const v = b.values[nav.active as number];
            return {
              name: b.name,
              value: v === null ? 'no data' : (b.displays[nav.active as number] ?? fmt(v)),
            };
          }),
        };

  return (
    <figure
      className={clsx('upmo-grouped-bar', 'upmo-chart', `upmo-grouped-bar--${orientation}`, className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <EChartFrame
        height={h}
        width={width}
        build={build}
        chartRef={chartRef}
        active={nav.active}
        navPlan={navPlan}
      />
      <ChartReadout data={readout} live={nav.focused} />
      <ChartLegend
        label={`${label} bars`}
        items={bars.map((b, i) => ({ color: b.color, name: b.name, hidden: hidden.has(i) }))}
        onToggle={toggle}
        onHover={hover}
      />
      <ChartDataTable
        title={label}
        labels={labels}
        columns={source.map((s, j) => ({
          name: s.name,
          cells: groups.map((g) => {
            const v = toCell(g.bars[j]?.value);
            return v === null ? 'No data' : (g.bars[j]?.display ?? fmt(v));
          }),
        }))}
      />
    </figure>
  );
}
