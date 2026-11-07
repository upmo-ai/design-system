import clsx from 'clsx';
import type { ReactNode } from 'react';
import {
  CHAR_W,
  MAX_GROUP_BARS,
  colorVar,
  defaultFormat,
  linear,
  niceScale,
  patternAt,
  sumCells,
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
  PatternDef,
  Swatch,
  XLabels,
  YAxis,
  fillFor,
  useChartNav,
  useChartWidth,
  useSafeId,
} from './chartParts.tsx';

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
   * The groups. Bars use chart-1 to chart-3 by position, each with its own
   * fill texture. Past the third bar, the rest are summed into one "Other" bar
   * in chart-mid.
   */
  groups: BarGroup[];
  /** Default 'vertical'. */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible title for the chart. */
  title?: string;
  /** Chart height in px. Default 220 vertical; horizontal grows with the number of groups. */
  height?: number;
  /** Starting width in px before the chart measures its container. Default 480. */
  width?: number;
  /** Formats axis ticks and values that have no `display`. */
  formatValue?: (n: number) => string;
  /** Name of the merged bar. Default "Other". */
  otherLabel?: string;
  /** Text shown when there is nothing to plot. Default "No data to show". */
  emptyText?: string;
  className?: string;
}

const PAD_TOP = 10;
const PAD_BOTTOM = 26;
const BAR_GAP = 2;

/**
 * A dependency-free grouped bar chart drawn as SVG, vertical or horizontal, with
 * a value axis, a legend of the bar names, and a readout on hover and keyboard
 * focus (arrow keys move between groups). Bars differ by fill texture as well as
 * colour. The SVG is hidden from assistive tech; a visually hidden table
 * (caption = title) carries every value.
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
  const fmt = formatValue ?? defaultFormat;
  const uid = useSafeId();
  const [plotRef, w] = useChartWidth(width);
  const nav = useChartNav(groups.length);

  const source = groups[0]?.bars ?? [];
  const barCount = source.length;
  if (groups.length === 0 || barCount === 0) {
    return (
      <figure className={clsx('upmo-grouped-bar', 'upmo-chart', className)} role="group" aria-label={label}>
        <EmptyChart text={emptyText} />
      </figure>
    );
  }

  // Resolve the bars a group draws: the first three as given, the rest as "Other".
  const folded = barCount > MAX_GROUP_BARS;
  const k = folded ? MAX_GROUP_BARS + 1 : barCount;
  const bars = Array.from({ length: k }, (_, j) => ({
    name: folded && j === MAX_GROUP_BARS ? otherLabel : source[j].name,
    color: folded && j === MAX_GROUP_BARS ? colorVar('mid') : colorVar((j + 1) as 1 | 2 | 3),
    pattern: patternAt(j),
    id: `${uid}-b${j}`,
  }));
  const cells = (g: number, j: number): Cell => {
    const row = groups[g].bars;
    return folded && j === MAX_GROUP_BARS
      ? sumCells(row.slice(MAX_GROUP_BARS).map((b) => toCell(b.value)))
      : toCell(row[j]?.value);
  };
  const shownDisplay = (g: number, j: number) => (folded && j === MAX_GROUP_BARS ? undefined : groups[g].bars[j]?.display);

  const values = groups.map((_, g) => bars.map((__, j) => cells(g, j)));
  const nums = values.flat().filter((v): v is number => v !== null);
  const scale = niceScale(Math.min(0, ...nums), Math.max(0, ...nums));
  const tickText = scale.ticks.map(fmt);
  const maxTick = Math.max(...tickText.map((t) => t.length));
  const maxLabel = Math.max(1, ...groups.map((g) => g.label.length));
  const horizontal = orientation === 'horizontal';

  const n = groups.length;
  const h = height ?? (horizontal ? Math.max(140, n * (k * 14 + 14) + PAD_TOP + PAD_BOTTOM) : 220);
  const plotH = h - PAD_TOP - PAD_BOTTOM;

  const readout =
    nav.active === null
      ? null
      : {
          label: groups[nav.active].label,
          items: bars.map((b, j) => {
            const v = values[nav.active as number][j];
            return {
              name: b.name,
              value: v === null ? 'no data' : (shownDisplay(nav.active as number, j) ?? fmt(v)),
            };
          }),
        };

  let plot: ReactNode;
  if (horizontal) {
    const padL = Math.min(w * 0.4, Math.max(40, Math.min(18, maxLabel) * CHAR_W + 14));
    const padR = Math.min(40, Math.max(14, Math.ceil((maxTick * CHAR_W) / 2)));
    const padT = 6;
    const innerH = h - padT - PAD_BOTTOM;
    const band = innerH / n;
    const x = linear(scale.min, scale.max, padL, w - padR);
    const x0 = x(0);
    const barH = Math.min(28, Math.max(2, (band * 0.76 - BAR_GAP * (k - 1)) / k));
    const stack = k * barH + (k - 1) * BAR_GAP;
    const rowStep = Math.max(1, Math.ceil(16 / band));
    const chars = Math.max(3, Math.floor((padL - 14) / CHAR_W));

    plot = (
      <>
        {scale.ticks.map((t) => (
          <line
            key={t}
            className={t === 0 ? 'upmo-chart__grid upmo-chart__grid--zero' : 'upmo-chart__grid'}
            x1={x(t)}
            x2={x(t)}
            y1={padT}
            y2={padT + innerH}
          />
        ))}
        <XLabels
          labels={tickText}
          x={(i) => x(scale.ticks[i])}
          baseline={h - 8}
          step={1}
          firstAnchor="start"
        />
        {nav.active !== null ? (
          <rect
            className="upmo-chart__band--active"
            x={padL}
            y={padT + nav.active * band}
            width={w - padR - padL}
            height={band}
          />
        ) : null}
        {groups.map((g, gi) => {
          const cy = padT + band * (gi + 0.5);
          return (
            <g key={gi}>
              {gi % rowStep === 0 ? (
                <text className="upmo-chart__tick" x={padL - 8} y={cy} dy="0.32em" textAnchor="end">
                  {truncate(g.label, chars)}
                </text>
              ) : null}
              {bars.map((b, j) => {
                const v = values[gi][j];
                if (v === null) return null;
                const xv = x(v);
                return (
                  <rect
                    key={j}
                    className="upmo-grouped-bar__bar"
                    data-bar={j}
                    x={Math.min(x0, xv)}
                    y={cy - stack / 2 + j * (barH + BAR_GAP)}
                    width={v === 0 ? 0 : Math.max(1, Math.abs(xv - x0))}
                    height={barH}
                    rx={2}
                    style={{ fill: fillFor(b.id, b.pattern, b.color) }}
                  />
                );
              })}
            </g>
          );
        })}
        {groups.map((_, gi) => (
          <rect
            key={gi}
            className="upmo-chart__hit"
            x={padL}
            y={padT + gi * band}
            width={w - padR - padL}
            height={band}
            onMouseEnter={() => nav.hover(gi)}
          />
        ))}
      </>
    );
  } else {
    const padL = Math.min(w * 0.4, Math.max(32, maxTick * CHAR_W + 14));
    const padR = Math.min(40, Math.max(14, Math.ceil((maxLabel * CHAR_W) / 2)));
    const band = (w - padL - padR) / n;
    const y = linear(scale.min, scale.max, PAD_TOP + plotH, PAD_TOP);
    const y0 = y(0);
    const barW = Math.min(40, Math.max(2, (band * 0.76 - BAR_GAP * (k - 1)) / k));
    const stack = k * barW + (k - 1) * BAR_GAP;
    const cx = (i: number) => padL + band * (i + 0.5);

    plot = (
      <>
        <YAxis
          ticks={scale.ticks}
          y={y}
          gridFrom={padL}
          gridTo={w - padR}
          labelX={padL - 8}
          anchor="end"
          format={fmt}
        />
        <XLabels labels={groups.map((g) => g.label)} x={cx} baseline={h - 8} step={thinStep(maxLabel, band)} />
        {nav.active !== null ? (
          <rect
            className="upmo-chart__band--active"
            x={padL + nav.active * band}
            y={PAD_TOP}
            width={band}
            height={plotH}
          />
        ) : null}
        {groups.map((_, gi) => (
          <g key={gi}>
            {bars.map((b, j) => {
              const v = values[gi][j];
              if (v === null) return null;
              const yv = y(v);
              return (
                <rect
                  key={j}
                  className="upmo-grouped-bar__bar"
                  data-bar={j}
                  x={cx(gi) - stack / 2 + j * (barW + BAR_GAP)}
                  y={Math.min(y0, yv)}
                  width={barW}
                  height={v === 0 ? 0 : Math.max(1, Math.abs(yv - y0))}
                  rx={2}
                  style={{ fill: fillFor(b.id, b.pattern, b.color) }}
                />
              );
            })}
          </g>
        ))}
        {groups.map((_, gi) => (
          <rect
            key={gi}
            className="upmo-chart__hit"
            x={padL + gi * band}
            y={PAD_TOP}
            width={band}
            height={plotH}
            onMouseEnter={() => nav.hover(gi)}
          />
        ))}
      </>
    );
  }

  return (
    <figure
      className={clsx('upmo-grouped-bar', 'upmo-chart', `upmo-grouped-bar--${orientation}`, className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <div className="upmo-chart__plot" ref={plotRef}>
        <svg
          className="upmo-chart__svg"
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
          focusable="false"
          onMouseLeave={nav.leave}
        >
          <defs>
            {bars.map((b) => (
              <PatternDef key={b.id} id={b.id} color={b.color} kind={b.pattern} />
            ))}
          </defs>
          {plot}
        </svg>
      </div>
      <ChartReadout data={readout} live={nav.focused} />
      <ChartLegendList
        items={bars.map((b) => ({
          name: b.name,
          swatch: <Swatch kind="bar" color={b.color} pattern={b.pattern} />,
        }))}
      />
      <ChartDataTable
        title={label}
        labels={groups.map((g) => g.label)}
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
