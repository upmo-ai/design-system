import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { ChartTable } from './BarChart.tsx';
import {
  maxOfCells,
  meanOf,
  resolveSeries,
  runsOf,
  styleAt,
  toCell,
  type Cell,
  type ColorIndex,
  type Curve,
} from './chartKit.ts';
import { legendFormatter, tickFormatter, tooltipFormatter } from './chartFormat.ts';
import { axisNavPlan, lineOption, type ChartSize, type LineRow } from './chartOptions.ts';
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

export interface LinePoint {
  label: string;
  value: number;
  /** Optional pre-formatted value for the data table. Defaults to value. */
  display?: string;
}

export interface LineSeriesPoint {
  label: string;
  /** null is a gap in the line, never zero. */
  value: number | null;
  /** Optional pre-formatted value for the readout and data table. Defaults to formatValue. */
  display?: string;
}

export interface LineSeries {
  name: string;
  /** Which chart colour token to use (1-6). Defaults to the series position. */
  colorIndex?: ColorIndex;
  /** One point per x position. Every series has the same length and labels come from the first. */
  points: LineSeriesPoint[];
}

export interface LineChartProps {
  /** A single series. Pass this or `series`. */
  data?: LinePoint[];
  /**
   * Several series on one x axis. When set, `data` is ignored and the chart is
   * drawn with ECharts (loaded lazily): a y axis, a hover tooltip with a
   * crosshair, a readout and a clickable legend. More than six series: the five
   * with the highest maximum value are kept and the rest are summed into one
   * "Other" series in chart-mid.
   */
  series?: LineSeries[];
  /** Chart height in px. Default 160 for `data`, 220 for `series`. */
  height?: number;
  /** Width in px for the viewBox. Default 480. With `series` the chart follows its container and uses this only while the container has no measurable width. */
  width?: number;
  title?: string;
  /** Which chart colour token to use (1-6). Default 1 (emerald). Only for `data`; each series sets its own. */
  colorIndex?: ColorIndex;
  /**
   * Fill the area under the line with a soft wash. Default true for `data` and
   * for a single series, false for several series. Stacked charts always fill.
   */
  area?: boolean;
  /** Stack the series on top of each other (series only). Values should be zero or more. Default false. */
  stacked?: boolean;
  /** Line shape (series only). Default 'smooth', a monotone curve that never dips below the data. 'linear' draws straight segments. */
  curve?: Curve;
  /**
   * Formats y axis ticks, the tooltip, the legend figures and the readout (series
   * only). Without it, axis ticks and legend figures use a compact form (536k,
   * 2.3M, 1.2B).
   */
  formatValue?: (n: number) => string;
  /** Show the legend under the plot, with each series' mean and max (series only). Default true. */
  legend?: boolean;
  /** Name of the merged series when there are more than six (series only). Default "Other". */
  otherLabel?: string;
  /** Text shown when there is nothing to plot (series only). Default "No data to show". */
  emptyText?: string;
  className?: string;
}

/**
 * A line chart for trends (cost over time, runs per hour). Pass `data` for one
 * dependency-free SVG line, or `series` for several smooth lines on one x axis,
 * drawn with ECharts (loaded lazily on first use): a floating tooltip with a
 * crosshair, a clickable legend that hides and shows series (with each mean and
 * max), keyboard stepping with a live readout, and a stacked mode. In high
 * contrast the lines gain symbols and dashes. The drawing is hidden from
 * assistive tech; a visually hidden table (caption = title) carries the data
 * points. Pair it with a nearby StatTile or caption so the trend is legible
 * without reading the curve.
 */
export function LineChart(props: LineChartProps) {
  if (props.series) return <SeriesLineChart {...props} series={props.series} />;
  return <SingleLineChart {...props} />;
}

function SingleLineChart({
  data = [],
  height = 160,
  width = 480,
  title,
  colorIndex = 1,
  area = true,
  className,
}: LineChartProps) {
  const pad = 6;
  // Non-finite values are gaps, as in the series chart: they are not plotted and
  // break the line, and they never reach an SVG attribute.
  const cells: Cell[] = data.map((d) => toCell(d.value));
  const finite = cells.filter((v): v is number => v !== null);
  const max = Math.max(1, ...finite);
  const min = Math.min(0, ...finite);
  const span = max - min || 1;

  const point = (i: number) => {
    const x = data.length === 1 ? pad : pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - ((cells[i] as number) - min) / span) * (height - pad * 2);
    return [x, y] as const;
  };

  const drawn = runsOf(cells).map((run) => {
    const points = run.map(point);
    const line = points.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPathData = `M ${points[0][0]},${height - pad} L ${line
      .split(' ')
      .join(' L ')} L ${points[points.length - 1][0]},${height - pad} Z`;
    return { key: run[0], line, areaPathData };
  });
  const stroke = `var(--chart-${colorIndex})`;

  return (
    <figure className={clsx('upmo-linechart', className)} role="group" aria-label={title ?? 'Line chart'}>
      <svg
        className="upmo-linechart__svg"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {drawn.map(({ key, line, areaPathData }) => (
          <g key={key}>
            {area ? <path d={areaPathData} fill={stroke} fillOpacity={0.12} stroke="none" /> : null}
            <polyline points={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <ChartTable title={title ?? 'Line chart'} rows={data} />
    </figure>
  );
}

function SeriesLineChart({
  series = [],
  height = 220,
  width = 480,
  title,
  area,
  stacked = false,
  curve = 'smooth',
  formatValue,
  legend = true,
  otherLabel = 'Other',
  emptyText = 'No data to show',
  className,
}: LineChartProps) {
  const label = title ?? 'Line chart';
  const { fmt, given, signature } = useFormatter(formatValue);
  const chartRef = useRef<ECharts | null>(null);

  // Rebuilt only when the data really changes, not when the caller passes a fresh array.
  const dataKey = JSON.stringify([series, otherLabel]);
  const labels = useKeyed((series[0]?.points ?? []).map((p) => p.label), dataKey);
  const n = labels.length;
  const rows = useKeyed<LineRow[]>(
    resolveSeries(series, labels, otherLabel).map((s, pos) => ({
      key: `s${pos}`,
      name: s.name,
      color: s.color,
      values: s.values,
      displays: s.displays,
      style: styleAt(pos),
    })),
    dataKey,
  );

  const [hidden, toggle] = useHiddenSeries(rows.map((r) => r.name).join('\u0000'), rows.length);
  const visible = useKeyed(rows.filter((_, i) => !hidden.has(i)), `${dataKey}|${[...hidden].join(',')}`);

  const nav = useChartNav(n);
  const tick = useKeyed(tickFormatter(given ? fmt : undefined), String(given));
  const tip = useKeyed(tooltipFormatter(given ? fmt : undefined), String(given));
  const legendFmt = useKeyed(legendFormatter(given ? fmt : undefined), String(given));

  const showArea = stacked || (area ?? rows.length === 1);
  const optionKey = [dataKey, [...hidden].join(','), stacked, showArea, curve, signature].join('|');
  const build = useCallback(
    (theme: ChartTheme, size: ChartSize) =>
      lineOption({ labels, rows: visible, stacked, area: showArea, curve, tick, tip, size }, theme),
    // The key stands for the content of labels, visible, tick and tip.
    [optionKey],
  );
  const navPlan = useCallback((i: number) => axisNavPlan(visible, i), [visible]);
  const legendTarget = useCallback(
    (i: number) => (hidden.has(i) ? null : { seriesId: rows[i].key }),
    [hidden, rows],
  );
  const hover = useLegendHover(chartRef, legendTarget);

  if (n === 0) {
    return (
      <figure className={clsx('upmo-linechart', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  const readout =
    nav.active === null
      ? null
      : {
          label: labels[nav.active],
          items: visible.map((row) => {
            const v = row.values[nav.active as number];
            return {
              name: row.name,
              value: v === null ? 'no data' : (row.displays[nav.active as number] ?? fmt(v)),
            };
          }),
        };

  return (
    <figure
      className={clsx('upmo-linechart', 'upmo-chart', className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <EChartFrame
        height={height}
        width={width}
        build={build}
        responsive
        chartRef={chartRef}
        active={nav.active}
        navPlan={navPlan}
      />
      <ChartReadout data={readout} live={nav.focused} />
      {legend ? (
        <ChartLegend
          label={`${label} series`}
          items={rows.map((row, i) => {
            const mean = meanOf(row.values);
            const top = maxOfCells(row.values);
            return {
              color: row.color,
              name: row.name,
              hidden: hidden.has(i),
              stats: [
                { label: 'Mean', value: mean === null ? 'No data' : legendFmt(mean) },
                { label: 'Max', value: top === null ? 'No data' : legendFmt(top) },
              ],
            };
          })}
          onToggle={toggle}
          onHover={hover}
        />
      ) : null}
      <ChartDataTable
        title={label}
        labels={labels}
        columns={series.map((s) => ({
          name: s.name,
          cells: labels.map((_, i) => cellText(s.points[i]?.value, s.points[i]?.display, fmt)),
        }))}
      />
    </figure>
  );
}

function cellText(value: unknown, display: string | undefined, fmt: (n: number) => string): string {
  const cell: Cell = toCell(value);
  return cell === null ? 'No data' : (display ?? fmt(cell));
}
