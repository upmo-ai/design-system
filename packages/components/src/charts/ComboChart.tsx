import clsx from 'clsx';
import {
  CHAR_W,
  colorVar,
  defaultFormat,
  linePath,
  linear,
  niceScale,
  runsOf,
  thinStep,
  toCell,
  truncate,
  type Cell,
} from './chartKit.ts';
import {
  ChartDataTable,
  ChartLegendList,
  ChartReadout,
  EmptyChart,
  Marker,
  Swatch,
  XLabels,
  YAxis,
  useChartNav,
  useChartWidth,
} from './chartParts.tsx';

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
  /** Drawn as one line against the right axis, in chart-2, with circle markers. */
  line: ComboSeries;
  /** Formats the left axis ticks and bar values that have no `display`. */
  formatBar?: (n: number) => string;
  /** Formats the right axis ticks and line values that have no `display`. */
  formatLine?: (n: number) => string;
  /** Accessible title for the chart. */
  title?: string;
  /** Chart height in px. Default 220. */
  height?: number;
  /** Starting width in px before the chart measures its container. Default 480. */
  width?: number;
  /** Text shown when there is nothing to plot. Default "No data to show". */
  emptyText?: string;
  className?: string;
}

const PAD_TOP = 10;
const PAD_BOTTOM = 26;
const TITLE_W = 16;
const MAX_MARKERS = 8;

/**
 * Bars on the left axis and one line on the right axis over the same x labels,
 * for a count beside a rate (runs and success rate, spend and cost per run).
 * Both axes carry ticks and a title naming their series; the legend repeats the
 * bar swatch and the line marker. Hover, or focus the chart and use the arrow
 * keys, to read both values at a position. The SVG is hidden from assistive
 * tech; a visually hidden table (caption = title) carries every value.
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
  const fmtBar = formatBar ?? defaultFormat;
  const fmtLine = formatLine ?? defaultFormat;
  // The longer series names the x positions (the bars when they are equal); the
  // shorter one shows gaps where it has no point.
  const labels = (line.points.length > bars.points.length ? line.points : bars.points).map((p) => p.label);
  const n = labels.length;
  const [plotRef, w] = useChartWidth(width);
  const nav = useChartNav(n);

  if (n === 0) {
    return (
      <figure className={clsx('upmo-combo', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  const barValues: Cell[] = labels.map((_, i) => toCell(bars.points[i]?.value));
  const lineValues: Cell[] = labels.map((_, i) => toCell(line.points[i]?.value));
  const nums = (cells: Cell[]) => cells.filter((v): v is number => v !== null);

  const left = niceScale(Math.min(0, ...nums(barValues)), Math.max(0, ...nums(barValues)));
  // Ask for the same tick count so the right axis ticks sit on the left gridlines.
  const right = niceScale(Math.min(0, ...nums(lineValues)), Math.max(0, ...nums(lineValues)), left.ticks.length);
  const leftText = left.ticks.map(fmtBar);
  const rightText = right.ticks.map(fmtLine);

  const maxLabel = Math.max(1, ...labels.map((l) => l.length));
  const padL = Math.min(w * 0.3, Math.max(48, Math.max(...leftText.map((t) => t.length)) * CHAR_W + 14 + TITLE_W));
  const padR = Math.min(w * 0.3, Math.max(48, Math.max(...rightText.map((t) => t.length)) * CHAR_W + 14 + TITLE_W));
  const plotW = w - padL - padR;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const band = plotW / n;
  const cx = (i: number) => padL + band * (i + 0.5);
  const yBar = linear(left.min, left.max, PAD_TOP + plotH, PAD_TOP);
  const yLine = linear(right.min, right.max, PAD_TOP + plotH, PAD_TOP);
  const y0 = yBar(0);
  const barW = Math.min(40, Math.max(2, band * 0.6));
  const markEvery = Math.max(1, Math.ceil(n / MAX_MARKERS));
  const barColor = colorVar(1);
  const lineColor = colorVar(2);
  const axisChars = Math.max(4, Math.floor(plotH / CHAR_W));

  const pointText = (cell: Cell, display: string | undefined, fmt: (v: number) => string, empty = 'no data') =>
    cell === null ? empty : (display ?? fmt(cell));

  const readout =
    nav.active === null
      ? null
      : {
          label: labels[nav.active],
          items: [
            {
              name: bars.name,
              value: pointText(barValues[nav.active], bars.points[nav.active]?.display, fmtBar),
            },
            {
              name: line.name,
              value: pointText(lineValues[nav.active], line.points[nav.active]?.display, fmtLine),
            },
          ],
        };

  const linePoints = (run: number[]) => run.map((i) => [cx(i), yLine(lineValues[i] as number)] as const);

  return (
    <figure
      className={clsx('upmo-combo', 'upmo-chart', className)}
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
            ticks={left.ticks}
            y={yBar}
            gridFrom={padL}
            gridTo={w - padR}
            labelX={padL - 8}
            anchor="end"
            format={fmtBar}
          />
          <YAxis
            ticks={right.ticks}
            y={yLine}
            gridFrom={padL}
            gridTo={w - padR}
            labelX={w - padR + 8}
            anchor="start"
            format={fmtLine}
            grid={false}
          />
          <text
            className="upmo-chart__axis-title"
            transform={`translate(${TITLE_W / 2} ${PAD_TOP + plotH / 2}) rotate(-90)`}
            dy="0.32em"
            textAnchor="middle"
          >
            {truncate(bars.name, axisChars)}
          </text>
          <text
            className="upmo-chart__axis-title"
            transform={`translate(${w - TITLE_W / 2} ${PAD_TOP + plotH / 2}) rotate(90)`}
            dy="0.32em"
            textAnchor="middle"
          >
            {truncate(line.name, axisChars)}
          </text>
          <XLabels labels={labels} x={cx} baseline={height - 8} step={thinStep(maxLabel, band)} />
          {nav.active !== null ? (
            <rect
              className="upmo-chart__band--active"
              x={padL + nav.active * band}
              y={PAD_TOP}
              width={band}
              height={plotH}
            />
          ) : null}
          {barValues.map((v, i) => {
            if (v === null) return null;
            const yv = yBar(v);
            return (
              <rect
                key={i}
                className="upmo-combo__bar"
                x={cx(i) - barW / 2}
                y={Math.min(y0, yv)}
                width={barW}
                height={v === 0 ? 0 : Math.max(1, Math.abs(yv - y0))}
                rx={2}
                style={{ fill: barColor }}
              />
            );
          })}
          {runsOf(lineValues)
            .filter((run) => run.length > 1)
            .map((run) => (
              <g key={run[0]}>
                <path className="upmo-combo__halo" d={linePath(linePoints(run), 'linear')} />
                <path
                  className="upmo-combo__line"
                  d={linePath(linePoints(run), 'linear')}
                  style={{ stroke: lineColor }}
                />
              </g>
            ))}
          {runsOf(lineValues).flatMap((run) =>
            run
              .filter((_, k) => run.length === 1 || k % markEvery === 0)
              .map((i) => (
                <Marker
                  key={`m-${i}`}
                  shape="circle"
                  cx={cx(i)}
                  cy={yLine(lineValues[i] as number)}
                  r={3.5}
                  className="upmo-chart__marker"
                  style={{ fill: lineColor }}
                />
              )),
          )}
          {nav.active !== null && lineValues[nav.active] !== null ? (
            <Marker
              shape="circle"
              cx={cx(nav.active)}
              cy={yLine(lineValues[nav.active] as number)}
              r={5}
              className="upmo-chart__marker upmo-chart__marker--active"
              style={{ fill: lineColor }}
            />
          ) : null}
          {labels.map((_, i) => (
            <rect
              key={i}
              className="upmo-chart__hit"
              x={padL + i * band}
              y={PAD_TOP}
              width={band}
              height={plotH}
              onMouseEnter={() => nav.hover(i)}
            />
          ))}
        </svg>
      </div>
      <ChartReadout data={readout} live={nav.focused} />
      <ChartLegendList
        items={[
          { name: bars.name, swatch: <Swatch kind="bar" color={barColor} /> },
          { name: line.name, swatch: <Swatch kind="line" color={lineColor} marker="circle" /> },
        ]}
      />
      <ChartDataTable
        title={label}
        labels={labels}
        columns={[
          {
            name: bars.name,
            cells: labels.map((_, i) => pointText(barValues[i], bars.points[i]?.display, fmtBar, 'No data')),
          },
          {
            name: line.name,
            cells: labels.map((_, i) => pointText(lineValues[i], line.points[i]?.display, fmtLine, 'No data')),
          },
        ]}
      />
    </figure>
  );
}
