import clsx from 'clsx';
import { ChartTable } from './BarChart.tsx';
import {
  CHAR_W,
  DASH,
  areaPath,
  bandPath,
  defaultFormat,
  linePath,
  linear,
  maxOfCells,
  meanOf,
  niceScale,
  resolveSeries,
  runsOf,
  styleAt,
  thinStep,
  toCell,
  type Cell,
  type ColorIndex,
  type Curve,
  type Pt,
} from './chartKit.ts';
import {
  ChartDataTable,
  ChartReadout,
  EmptyChart,
  Marker,
  Swatch,
  XLabels,
  YAxis,
  useChartNav,
  useChartWidth,
} from './chartParts.tsx';

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
   * Several series on one x axis. When set, `data` is ignored and the chart
   * draws a y axis, a readout and a legend table. More than six series: the five
   * with the highest maximum value are kept and the rest are summed into one
   * "Other" series in chart-mid.
   */
  series?: LineSeries[];
  /** Chart height in px. Default 160 for `data`, 220 for `series`. */
  height?: number;
  /** Width in px for the viewBox. Default 480. With `series` it is the starting width before the chart measures its container. */
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
  /** Line shape (series only). Default 'linear'. */
  curve?: Curve;
  /** Formats y axis ticks, the legend and the readout (series only). */
  formatValue?: (n: number) => string;
  /** Show the legend table under the plot (series only). Default true. */
  legend?: boolean;
  /** Name of the merged series when there are more than six (series only). Default "Other". */
  otherLabel?: string;
  /** Text shown when there is nothing to plot (series only). Default "No data to show". */
  emptyText?: string;
  className?: string;
}

/**
 * A minimal, dependency-free line chart drawn as SVG, for trends (cost over
 * time, runs per hour). Pass `data` for one line, or `series` for several lines
 * on one x axis with a y axis, a keyboard and hover readout, and a legend table
 * of mean and max. Series differ by marker shape and dash as well as colour. The
 * SVG is hidden from assistive tech; a visually hidden table (caption = title)
 * carries the data points. Pair it with a nearby StatTile or caption so the
 * trend is legible without reading the curve.
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

const PAD_TOP = 10;
const PAD_BOTTOM = 26;
const INSET = 8;
const MARKER_R = 3.5;
const MAX_MARKERS = 8;

function SeriesLineChart({
  series = [],
  height = 220,
  width = 480,
  title,
  area,
  stacked = false,
  curve = 'linear',
  formatValue,
  legend = true,
  otherLabel = 'Other',
  emptyText = 'No data to show',
  className,
}: LineChartProps) {
  const label = title ?? 'Line chart';
  const labels = (series[0]?.points ?? []).map((p) => p.label);
  const n = labels.length;
  const fmt = formatValue ?? defaultFormat;
  const [plotRef, w] = useChartWidth(width);
  const nav = useChartNav(n);

  if (n === 0) {
    return (
      <figure className={clsx('upmo-linechart', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  const rows = resolveSeries(series, labels, otherLabel).map((s, position) => ({ ...s, style: styleAt(position) }));

  // Stacked layers: each series sits on the running total of the ones before it.
  // A null adds nothing and its layer is not drawn at that x.
  const bottoms: number[][] = [];
  const tops: number[][] = [];
  if (stacked) {
    let base: number[] = new Array<number>(n).fill(0);
    for (const row of rows) {
      bottoms.push(base);
      const top = base.map((b, i) => {
        const v = row.values[i];
        return v === null ? b : b + Math.max(0, v);
      });
      tops.push(top);
      base = top;
    }
  }

  const plotted = stacked
    ? tops.flat()
    : rows.flatMap((r) => r.values).filter((v): v is number => v !== null);
  const scale = niceScale(Math.min(0, ...plotted), Math.max(0, ...plotted));
  const tickText = scale.ticks.map(fmt);

  const maxLabel = Math.max(1, ...labels.map((l) => l.length));
  const padL = Math.min(w * 0.4, Math.max(32, Math.max(...tickText.map((t) => t.length)) * CHAR_W + 14));
  const padR = Math.min(40, Math.max(14, Math.ceil((maxLabel * CHAR_W) / 2)));
  const plotW = w - padL - padR;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const x = (i: number) =>
    n === 1 ? padL + plotW / 2 : padL + INSET + (i / (n - 1)) * (plotW - INSET * 2);
  const y = linear(scale.min, scale.max, PAD_TOP + plotH, PAD_TOP);
  const spacing = n > 1 ? (plotW - INSET * 2) / (n - 1) : plotW;
  const step = thinStep(maxLabel, spacing);
  const markEvery = Math.max(1, Math.ceil(n / MAX_MARKERS));

  const showArea = stacked || (area ?? rows.length === 1);

  const edge = (pos: number, i: number): Pt => [x(i), y(stacked ? tops[pos][i] : (rows[pos].values[i] as number))];

  const areas = showArea
    ? rows.flatMap((row, pos) =>
        runsOf(row.values)
          .filter((run) => run.length > 1)
          .map((run) => {
            const upper = run.map((i) => edge(pos, i));
            const d = stacked
              ? bandPath(upper, run.map((i): Pt => [x(i), y(bottoms[pos][i])]), curve)
              : areaPath(upper, y(0), curve);
            return (
              <path
                key={`a-${pos}-${run[0]}`}
                className="upmo-linechart__area"
                d={d}
                data-series={pos}
                style={{ fill: row.color, fillOpacity: stacked ? 0.32 : 0.12 }}
              />
            );
          }),
      )
    : [];

  const lines = rows.flatMap((row, pos) =>
    runsOf(row.values)
      .filter((run) => run.length > 1)
      .map((run) => (
        <path
          key={`l-${pos}-${run[0]}`}
          className="upmo-linechart__run"
          d={linePath(
            run.map((i) => edge(pos, i)),
            curve,
          )}
          data-series={pos}
          strokeDasharray={row.style.dashed ? DASH : undefined}
          style={{ stroke: row.color }}
        />
      )),
  );

  const markers = rows.flatMap((row, pos) =>
    runsOf(row.values).flatMap((run) =>
      run
        .filter((_, k) => run.length === 1 || (k + pos) % markEvery === 0)
        .map((i) => {
          const [cx, cy] = edge(pos, i);
          return (
            <Marker
              key={`m-${pos}-${i}`}
              shape={row.style.marker}
              cx={cx}
              cy={cy}
              r={MARKER_R}
              className="upmo-chart__marker"
              style={{ fill: row.color }}
            />
          );
        }),
    ),
  );

  const readout =
    nav.active === null
      ? null
      : {
          label: labels[nav.active],
          items: rows.map((row) => {
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
      <div className="upmo-chart__plot" ref={plotRef}>
        <svg
          className="upmo-chart__svg"
          viewBox={`0 0 ${w} ${height}`}
          aria-hidden="true"
          focusable="false"
          onMouseLeave={nav.leave}
        >
          <YAxis
            ticks={scale.ticks}
            y={y}
            gridFrom={padL}
            gridTo={w - padR}
            labelX={padL - 8}
            anchor="end"
            format={fmt}
          />
          <XLabels labels={labels} x={x} baseline={height - 8} step={step} />
          {nav.active !== null ? (
            <line
              className="upmo-chart__guide"
              x1={x(nav.active)}
              x2={x(nav.active)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotH}
            />
          ) : null}
          {areas}
          {lines}
          {markers}
          {nav.active !== null
            ? rows.map((row, pos) => {
                if (row.values[nav.active as number] === null) return null;
                const [cx, cy] = edge(pos, nav.active as number);
                return (
                  <Marker
                    key={`am-${pos}`}
                    shape={row.style.marker}
                    cx={cx}
                    cy={cy}
                    r={MARKER_R + 1.5}
                    className="upmo-chart__marker upmo-chart__marker--active"
                    style={{ fill: row.color }}
                  />
                );
              })
            : null}
          {labels.map((_, i) => (
            <rect
              key={i}
              className="upmo-chart__hit"
              x={x(i) - (n > 1 ? spacing : plotW) / 2}
              y={PAD_TOP}
              width={n > 1 ? spacing : plotW}
              height={plotH}
              onMouseEnter={() => nav.hover(i)}
            />
          ))}
        </svg>
      </div>
      <ChartReadout data={readout} live={nav.focused} />
      {legend ? (
        <table className="upmo-chart__legend" aria-label={`${label} series`}>
          <thead>
            <tr>
              <th scope="col">Series</th>
              <th scope="col" className="upmo-chart__legend-num">
                Mean
              </th>
              <th scope="col" className="upmo-chart__legend-num">
                Max
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, pos) => {
              const mean = meanOf(row.values);
              const top = maxOfCells(row.values);
              return (
                <tr key={pos}>
                  <th scope="row">
                    <span className="upmo-chart__legend-name">
                      <Swatch kind="line" color={row.color} marker={row.style.marker} dashed={row.style.dashed} />
                      <span>{row.name}</span>
                    </span>
                  </th>
                  <td className="upmo-chart__legend-num">{mean === null ? 'No data' : fmt(mean)}</td>
                  <td className="upmo-chart__legend-num">{top === null ? 'No data' : fmt(top)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
