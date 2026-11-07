/**
 * Pure helpers shared by the multi-series charts: axis scales, curve paths,
 * label thinning and the six-colour cap. No React and no DOM here, so the maths
 * is unit-tested on its own.
 */

export type ColorIndex = 1 | 2 | 3 | 4 | 5 | 6;

/** A plotted value; null is a gap and is never drawn as zero. */
export type Cell = number | null;

/** Average glyph width in px for the caption size; used to budget label room. */
export const CHAR_W = 7;

/** How many series, slices or bars a chart colours before it folds the rest into "Other". */
export const MAX_SERIES = 6;

/** Slices a donut keeps before it folds the rest into "Other". */
export const MAX_SLICES = 5;

/** Bars per group a grouped bar chart keeps before it folds the rest into "Other". */
export const MAX_GROUP_BARS = 3;

export const colorVar = (index: ColorIndex | 'mid') => `var(--chart-${index})`;

/** A value as a plotted cell: finite numbers stay, everything else is a gap. */
export function toCell(value: unknown): Cell {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Trims float noise (0.30000000000000004 -> 0.3) without locale rules. */
export function defaultFormat(n: number): string {
  return String(Number(n.toFixed(10)));
}

/** A share of a whole as text: whole percent from 10%, one decimal below. */
export function percentText(share: number): string {
  const pct = share * 100;
  if (!(pct > 0)) return '0%';
  if (pct < 0.05) return '<0.1%';
  return pct >= 9.95 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
}

/**
 * The shares of `amounts` as text, rounded together so they add up to exactly
 * 100% at the precision each one shows. A share shows a whole percent from 10%
 * and one decimal below (as percentText does); a zero share is "0%" and one under
 * 0.05% is "<0.1%". Each share is rounded down to its precision, then the
 * leftover is handed out one step at a time to the largest remainders
 * (largest-remainder rounding). Amounts must be zero or more.
 */
export function percentTexts(amounts: readonly number[]): string[] {
  const total = amounts.reduce((sum, a) => sum + (a > 0 ? a : 0), 0);
  if (!(total > 0)) return amounts.map(() => '0%');

  // Work in tenths of a percent: the whole must come to 1000.
  interface Part {
    index: number;
    step: number;
    units: number;
    remainder: number;
  }
  const parts: Part[] = [];
  amounts.forEach((a, index) => {
    const exact = ((a > 0 ? a : 0) / total) * 1000;
    if (exact < 0.5) return; // "0%" or "<0.1%": takes no share of the 100.
    const step = exact >= 99.5 ? 10 : 1;
    const whole = Math.floor(exact / step + 1e-9);
    parts.push({ index, step, units: whole * step, remainder: exact / step - whole });
  });

  let left = 1000 - parts.reduce((sum, p) => sum + p.units, 0);
  const order = [...parts].sort((x, y) => y.remainder - x.remainder || x.index - y.index);
  while (left > 0) {
    let moved = false;
    for (const p of order) {
      if (p.step <= left) {
        p.units += p.step;
        left -= p.step;
        moved = true;
        if (left === 0) break;
      }
    }
    if (!moved) break;
  }

  const byIndex = new Map(parts.map((p) => [p.index, p]));
  return amounts.map((a, index) => {
    const p = byIndex.get(index);
    if (!p || p.units === 0) return a > 0 ? '<0.1%' : '0%';
    return p.step === 10 ? `${p.units / 10}%` : `${(p.units / 10).toFixed(1)}%`;
  });
}

/** Shortens a label to at most `max` characters, ending in an ellipsis. */
export function truncate(label: string, max: number): string {
  if (label.length <= max) return label;
  return `${label.slice(0, Math.max(1, max - 1))}\u2026`;
}

// --- Axis scale ---------------------------------------------------------------

export interface Scale {
  /** Tick values, ascending. The first and last bound the domain. */
  ticks: number[];
  min: number;
  max: number;
  step: number;
}

const MANTISSAS = [1, 2, 2.5, 5];

/**
 * A "nice" axis for the range lo..hi: a step of 1, 2, 2.5 or 5 times a power
 * of ten, bounds rounded out to whole steps, and 4 or 5 ticks. The tightest
 * step that gives 4 or 5 ticks wins. Pass `count` to ask for exactly that many
 * ticks (to line up the gridlines of a second axis); it is honoured when a
 * nice step can give it.
 */
export function niceScale(lo: number, hi: number, count?: number): Scale {
  let a = Number.isFinite(lo) ? lo : 0;
  let b = Number.isFinite(hi) ? hi : 1;
  if (b < a) [a, b] = [b, a];
  if (a === b) {
    if (a === 0) b = 1;
    else if (a > 0) a = 0;
    else b = 0;
  }

  const exp = Math.floor(Math.log10((b - a) / 4));
  const candidates: Scale[] = [];
  for (let e = exp - 1; e <= exp + 2; e++) {
    for (const m of MANTISSAS) {
      const step = m * 10 ** e;
      const start = Math.floor(a / step + 1e-9) * step;
      const end = Math.ceil(b / step - 1e-9) * step;
      const n = Math.round((end - start) / step) + 1;
      const ticks = Array.from({ length: n }, (_, i) => Number((start + i * step).toFixed(10)));
      candidates.push({ ticks, min: ticks[0], max: ticks[n - 1], step });
    }
  }

  const byStep = (x: Scale, y: Scale) => x.step - y.step;
  if (count !== undefined) {
    const exact = candidates.filter((c) => c.ticks.length === count).sort(byStep);
    if (exact.length) return exact[0];
  }
  const fit = candidates.filter((c) => c.ticks.length >= 4 && c.ticks.length <= 5).sort(byStep);
  if (fit.length) return fit[0];
  return candidates.sort((x, y) => Math.abs(x.ticks.length - 4.5) - Math.abs(y.ticks.length - 4.5))[0];
}

/** Maps a value in [min, max] linearly onto [from, to]. */
export function linear(min: number, max: number, from: number, to: number) {
  const span = max - min || 1;
  return (v: number) => from + ((v - min) / span) * (to - from);
}

// --- Label thinning -------------------------------------------------------------

/**
 * Show every nth label so labels of `maxChars` characters do not touch when
 * their anchors are `spacing` px apart.
 */
export function thinStep(maxChars: number, spacing: number): number {
  const need = maxChars * CHAR_W + 12;
  return Math.max(1, Math.ceil(need / Math.max(1, spacing)));
}

// --- Paths ----------------------------------------------------------------------

export type Pt = readonly [number, number];
export type Curve = 'linear' | 'smooth';

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The segments after the first point of a run: `L` steps for linear, monotone
 * cubic steps for smooth. The curve never overshoots the data, so a smooth
 * line cannot dip below a zero baseline between two points.
 */
export function segments(points: readonly Pt[], curve: Curve): string {
  if (points.length < 2) return '';
  if (curve === 'linear' || points.length === 2) {
    return points
      .slice(1)
      .map(([x, y]) => `L ${r2(x)},${r2(y)}`)
      .join(' ');
  }
  const n = points.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    d.push(dx === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx);
  }
  const m: number[] = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  const out: string[] = [];
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = x1 - x0;
    out.push(
      `C ${r2(x0 + h / 3)},${r2(y0 + (m[i] * h) / 3)} ${r2(x1 - h / 3)},${r2(y1 - (m[i + 1] * h) / 3)} ${r2(x1)},${r2(y1)}`,
    );
  }
  return out.join(' ');
}

/** A run of points as an open path. */
export function linePath(points: readonly Pt[], curve: Curve): string {
  if (points.length === 0) return '';
  return `M ${r2(points[0][0])},${r2(points[0][1])} ${segments(points, curve)}`.trim();
}

/** A run of points closed down to a flat baseline, for an area wash. */
export function areaPath(points: readonly Pt[], baseline: number, curve: Curve): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `M ${r2(first[0])},${r2(baseline)} L ${r2(first[0])},${r2(first[1])} ${segments(points, curve)} L ${r2(last[0])},${r2(baseline)} Z`;
}

/** The band between a lower and an upper edge, for stacked areas. */
export function bandPath(upper: readonly Pt[], lower: readonly Pt[], curve: Curve): string {
  if (upper.length === 0) return '';
  const back = [...lower].reverse();
  return `M ${r2(upper[0][0])},${r2(upper[0][1])} ${segments(upper, curve)} L ${r2(back[0][0])},${r2(back[0][1])} ${segments(back, curve)} Z`;
}

/** Index ranges of consecutive non-null cells; a null ends a run. */
export function runsOf(values: readonly Cell[]): number[][] {
  const runs: number[][] = [];
  let current: number[] = [];
  values.forEach((v, i) => {
    if (v === null) {
      if (current.length) runs.push(current);
      current = [];
    } else {
      current.push(i);
    }
  });
  if (current.length) runs.push(current);
  return runs;
}

/** An annular sector, or a full ring when the sweep covers the whole circle. */
export function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
  const pt = (r: number, a: number) => `${r2(cx + r * Math.sin(a))},${r2(cy - r * Math.cos(a))}`;
  if (a1 - a0 >= Math.PI * 2 - 1e-6) {
    const ring = (r: number) =>
      `M ${r2(cx)},${r2(cy - r)} A ${r},${r} 0 1 1 ${r2(cx)},${r2(cy + r)} A ${r},${r} 0 1 1 ${r2(cx)},${r2(cy - r)} Z`;
    return `${ring(rOuter)} ${ring(rInner)}`;
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${pt(rOuter, a0)} A ${rOuter},${rOuter} 0 ${large} 1 ${pt(rOuter, a1)} L ${pt(rInner, a1)} A ${rInner},${rInner} 0 ${large} 0 ${pt(rInner, a0)} Z`;
}

// --- Series styling -------------------------------------------------------------

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'diamond';

export interface SeriesStyle {
  marker: MarkerShape;
  dashed: boolean;
}

/** Circle, square, triangle, diamond, then the same four dashed. */
export const seriesStyles: readonly SeriesStyle[] = [
  { marker: 'circle', dashed: false },
  { marker: 'square', dashed: false },
  { marker: 'triangle', dashed: false },
  { marker: 'diamond', dashed: false },
  { marker: 'circle', dashed: true },
  { marker: 'square', dashed: true },
  { marker: 'triangle', dashed: true },
  { marker: 'diamond', dashed: true },
];

export const styleAt = (position: number): SeriesStyle => seriesStyles[position % seriesStyles.length];

export const DASH = '6 4';

export type PatternKind = 'solid' | 'stripe' | 'dots' | 'stripe-back' | 'lines' | 'grid';

/** Fill textures for bars and slices, so a fill is never told apart by colour alone. */
export const patternKinds: readonly PatternKind[] = ['solid', 'stripe', 'dots', 'stripe-back', 'lines', 'grid'];

export const patternAt = (position: number): PatternKind => patternKinds[position % patternKinds.length];

// --- The six-colour cap ---------------------------------------------------------

export interface SourceSeries {
  name: string;
  colorIndex?: ColorIndex;
  points: readonly { label: string; value: number | null; display?: string }[];
}

export interface ShownSeries {
  name: string;
  /** Always one value per x position; missing or non-finite values are null. */
  values: Cell[];
  /** The caller's per-point display strings, by position. */
  displays: (string | undefined)[];
  /** chart-1..6, or chart-mid for the merged "Other" series. */
  color: string;
  merged: boolean;
}

/**
 * Resolves the series a chart draws. Up to six series are drawn as given. With
 * more, the five with the highest maximum value are kept (in their original
 * order) and the rest are summed point by point into one "Other" series in
 * chart-mid, so a chart never needs a seventh colour. A series with no values
 * ranks last. Ties keep the earlier series.
 */
export function resolveSeries(
  series: readonly SourceSeries[],
  labels: readonly string[],
  otherLabel: string,
): ShownSeries[] {
  const toShown = (s: SourceSeries, position: number): ShownSeries => ({
    name: s.name,
    values: labels.map((_, i) => toCell(s.points[i]?.value)),
    displays: labels.map((_, i) => s.points[i]?.display),
    color: colorVar(s.colorIndex ?? (((position % 6) + 1) as ColorIndex)),
    merged: false,
  });

  if (series.length <= MAX_SERIES) return series.map(toShown);

  const maxOf = (s: SourceSeries) => {
    const nums = labels.map((_, i) => toCell(s.points[i]?.value)).filter((v): v is number => v !== null);
    return nums.length ? Math.max(...nums) : -Infinity;
  };
  const keep = new Set(
    series
      .map((s, i) => ({ i, score: maxOf(s) }))
      .sort((x, y) => y.score - x.score || x.i - y.i)
      .slice(0, MAX_SERIES - 1)
      .map((r) => r.i),
  );
  const kept = series.filter((_, i) => keep.has(i)).map(toShown);
  const rest = series.filter((_, i) => !keep.has(i));
  const other: ShownSeries = {
    name: otherLabel,
    values: labels.map((_, i) => sumCells(rest.map((s) => toCell(s.points[i]?.value)))),
    displays: labels.map(() => undefined),
    color: colorVar('mid'),
    merged: true,
  };
  return [...kept, other];
}

/** Sum of the non-null cells, or null when every cell is null. */
export function sumCells(cells: readonly Cell[]): Cell {
  const nums = cells.filter((c): c is number => c !== null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}

export function meanOf(values: readonly Cell[]): Cell {
  const nums = values.filter((c): c is number => c !== null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

export function maxOfCells(values: readonly Cell[]): Cell {
  const nums = values.filter((c): c is number => c !== null);
  return nums.length ? Math.max(...nums) : null;
}
