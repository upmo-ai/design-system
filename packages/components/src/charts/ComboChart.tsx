import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { colorVar, toCell, type Cell } from './chartKit.ts';
import { tickFormatter, tooltipFormatter } from './chartFormat.ts';
import { COMBO_BARS_KEY, COMBO_LINE_KEY, axisNavPlan, comboOption } from './chartOptions.ts';
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

export interface ComboPoint {
  label: string;
  /** null skips the bar or leaves a gap in the line; it is never drawn as zero. */
  value: number | null;
  /** Optional pre-formatted value for the readout and data table. Defaults to the series formatter. */
  display?: string;
}

export interface ComboSeries {
  name: string;
  /** One point per x position. The longer of the two series supplies the labels (the bars when equal); the other is matched by position and shows gaps past its end. */
  points: ComboPoint[];
}

export interface ComboChartProps {
  /** Drawn as bars against the left axis, in chart-1. */
  bars: ComboSeries;
  /** Drawn as one smooth line against the right axis, in chart-2. */
  line: ComboSeries;
  /** Formats the left axis ticks, the tooltip and bar values that have no `display`. Without it, ticks use a compact form (536k, 2.3M). */
  formatBar?: (n: number) => string;
  /** Formats the right axis ticks, the tooltip and line values that have no `display`. Without it, ticks use a compact form. */
  formatLine?: (n: number) => string;
  /** Accessible title for the chart. */
  title?: string;
  /** Chart height in px. Default 220. */
  height?: number;
  /** Width in px used only while the container has no measurable width. The chart otherwise follows its container. Default 480. */
  width?: number;
  /** Text shown when there is nothing to plot. Default "No data to show". */
  emptyText?: string;
  className?: string;
}

/**
 * Bars on the left axis and one line on the right axis over the same x labels,
 * for a count beside a rate (runs and success rate, spend and cost per run), drawn
 * with ECharts (loaded lazily on first use). The two axes share their gridlines,
 * each is named by its series, hover shows a tooltip with both values, and the
 * legend hides and shows either series. Focus the chart and use the arrow keys to
 * read both values at a position. In high contrast the bars gain a fill pattern and
 * the line gains symbols. The drawing is hidden from assistive tech; a visually
 * hidden table (caption = title) carries every value.
 */
export function ComboChart({
  bars,
  line,
  formatBar,
  formatLine,
  title,
  height = 220,
  width = 480,
  emptyText = 'No data to show',
  className,
}: ComboChartProps) {
  const label = title ?? 'Combo chart';
  const barFormat = useFormatter(formatBar);
  const lineFormat = useFormatter(formatLine);
  const chartRef = useRef<ECharts | null>(null);

  // The longer series names the x positions (the bars when they are equal); the
  // shorter one shows gaps where it has no point.
  const dataKey = JSON.stringify([bars, line]);
  const labels = useKeyed(
    (line.points.length > bars.points.length ? line.points : bars.points).map((p) => p.label),
    dataKey,
  );
  const n = labels.length;
  const barValues = useKeyed<Cell[]>(labels.map((_, i) => toCell(bars.points[i]?.value)), dataKey);
  const lineValues = useKeyed<Cell[]>(labels.map((_, i) => toCell(line.points[i]?.value)), dataKey);
  const barDisplays = useKeyed(labels.map((_, i) => bars.points[i]?.display), dataKey);
  const lineDisplays = useKeyed(labels.map((_, i) => line.points[i]?.display), dataKey);

  const [hidden, toggle] = useHiddenSeries([bars.name, line.name].join('\u0000'), 2);
  const showBars = !hidden.has(0);
  const showLine = !hidden.has(1);
  const barColor = colorVar(1);
  const lineColor = colorVar(2);

  const visibleSeries = useKeyed(
    [
      ...(showBars ? [{ key: COMBO_BARS_KEY, values: barValues }] : []),
      ...(showLine ? [{ key: COMBO_LINE_KEY, values: lineValues }] : []),
    ],
    `${dataKey}|${showBars}|${showLine}`,
  );

  const nav = useChartNav(n);
  const tickBar = useKeyed(tickFormatter(barFormat.given ? barFormat.fmt : undefined), String(barFormat.given));
  const tickLine = useKeyed(tickFormatter(lineFormat.given ? lineFormat.fmt : undefined), String(lineFormat.given));
  const tipBar = useKeyed(tooltipFormatter(barFormat.given ? barFormat.fmt : undefined), String(barFormat.given));
  const tipLine = useKeyed(tooltipFormatter(lineFormat.given ? lineFormat.fmt : undefined), String(lineFormat.given));

  const optionKey = [dataKey, showBars, showLine, barFormat.signature, lineFormat.signature].join('|');
  const build = useCallback(
    (theme: ChartTheme) =>
      comboOption(
        {
          labels,
          bars: { name: bars.name, color: barColor, values: barValues, displays: barDisplays },
          line: { name: line.name, color: lineColor, values: lineValues, displays: lineDisplays },
          showBars,
          showLine,
          tickBar,
          tickLine,
          tipBar,
          tipLine,
        },
        theme,
      ),
    // The key stands for the content of the labels, values and formatters.
    [optionKey],
  );
  const navPlan = useCallback((i: number) => axisNavPlan(visibleSeries, i), [visibleSeries]);
  const legendTarget = useCallback(
    (i: number) => (hidden.has(i) ? null : { seriesId: i === 0 ? COMBO_BARS_KEY : COMBO_LINE_KEY }),
    [hidden],
  );
  const hover = useLegendHover(chartRef, legendTarget);

  if (n === 0) {
    return (
      <figure className={clsx('upmo-combo', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  const pointText = (cell: Cell, display: string | undefined, fmt: (v: number) => string, empty = 'no data') =>
    cell === null ? empty : (display ?? fmt(cell));

  const readout =
    nav.active === null
      ? null
      : {
          label: labels[nav.active],
          items: [
            ...(showBars
              ? [{ name: bars.name, value: pointText(barValues[nav.active], barDisplays[nav.active], barFormat.fmt) }]
              : []),
            ...(showLine
              ? [{ name: line.name, value: pointText(lineValues[nav.active], lineDisplays[nav.active], lineFormat.fmt) }]
              : []),
          ],
        };

  return (
    <figure
      className={clsx('upmo-combo', 'upmo-chart', className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <EChartFrame
        height={height}
        width={width}
        build={build}
        chartRef={chartRef}
        active={nav.active}
        navPlan={navPlan}
      />
      <ChartReadout data={readout} live={nav.focused} />
      <ChartLegend
        label={`${label} series`}
        items={[
          { color: barColor, name: bars.name, hidden: hidden.has(0) },
          { color: lineColor, name: line.name, hidden: hidden.has(1) },
        ]}
        onToggle={toggle}
        onHover={hover}
      />
      <ChartDataTable
        title={label}
        labels={labels}
        columns={[
          {
            name: bars.name,
            cells: labels.map((_, i) => pointText(barValues[i], barDisplays[i], barFormat.fmt, 'No data')),
          },
          {
            name: line.name,
            cells: labels.map((_, i) => pointText(lineValues[i], lineDisplays[i], lineFormat.fmt, 'No data')),
          },
        ]}
      />
    </figure>
  );
}
