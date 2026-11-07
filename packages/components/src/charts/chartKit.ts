/**
 * Pure helpers shared by the multi-series charts: axis scales, the six-colour
 * cap and rounded shares. No React and no DOM here, so the maths is unit-tested
 * on its own. Drawing is ECharts' job; see chartOptions.ts.
 */

export type ColorIndex = 1 | 2 | 3 | 4 | 5 | 6;

/** A plotted value; null is a gap and is never drawn as zero. */
export type Cell = number | null;

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

/**
 * A scale with exactly `count` ticks, so a second value axis shares the
 * gridlines of the first. A nice step is used when one gives that count;
 * otherwise the nice range is split into equal parts, which keeps the
 * gridlines aligned at the cost of rounder labels.
 */
export function alignedScale(lo: number, hi: number, count: number): Scale {
  const scale = niceScale(lo, hi, count);
  if (scale.ticks.length === count || count < 2) return scale;
  const step = (scale.max - scale.min) / (count - 1);
  const ticks = Array.from({ length: count }, (_, i) => Number((scale.min + i * step).toFixed(10)));
  return { ticks, min: scale.min, max: scale.max, step };
}

export type Curve = 'linear' | 'smooth';

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

// --- Series styling -------------------------------------------------------------

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'diamond';

export interface SeriesStyle {
  marker: MarkerShape;
  dashed: boolean;
}

/**
 * Circle, square, triangle, diamond, then the same four dashed. Used only when
 * colour must not be the sole cue (high contrast): the normal themes draw plain
 * lines.
 */
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
