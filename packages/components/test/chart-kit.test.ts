import { describe, expect, it } from 'vitest';
import {
  alignedScale,
  maxOfCells,
  meanOf,
  niceScale,
  percentText,
  percentTexts,
  resolveSeries,
  runsOf,
  styleAt,
  sumCells,
} from '../src/charts/chartKit.ts';

describe('niceScale', () => {
  it('gives round ticks for common ranges', () => {
    expect(niceScale(0, 100).ticks).toEqual([0, 25, 50, 75, 100]);
    expect(niceScale(0, 7).ticks).toEqual([0, 2, 4, 6, 8]);
    expect(niceScale(0, 1).ticks).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(niceScale(0, 1284).ticks).toEqual([0, 500, 1000, 1500]);
  });

  it('always gives 4 or 5 ticks that cover the range', () => {
    const highs = [0.003, 0.7, 1, 3, 4.4, 5.2, 7, 9.9, 10.2, 12.6, 20.5, 33, 99, 100, 101, 1284, 25000, 1e6, 7.3e7];
    const lows = [0, -0.4, -3, -12, -250];
    for (const hi of highs) {
      for (const lo of lows) {
        const scale = niceScale(lo, hi);
        expect(scale.ticks.length, `${lo}..${hi}`).toBeGreaterThanOrEqual(4);
        expect(scale.ticks.length, `${lo}..${hi}`).toBeLessThanOrEqual(5);
        expect(scale.min).toBeLessThanOrEqual(lo);
        expect(scale.max).toBeGreaterThanOrEqual(hi);
        expect(scale.ticks).toEqual([...scale.ticks].sort((a, b) => a - b));
      }
    }
  });

  it('draws a 0 to 1 axis for an all-zero range', () => {
    const scale = niceScale(0, 0);
    expect(scale.min).toBe(0);
    expect(scale.max).toBe(1);
  });

  it('keeps ticks free of float noise', () => {
    expect(niceScale(0, 0.3).ticks).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it('honours a requested tick count when a nice step can give it', () => {
    expect(niceScale(0, 100, 5).ticks).toHaveLength(5);
    expect(niceScale(0, 8, 5).ticks).toHaveLength(5);
  });
});

describe('resolveSeries', () => {
  const labels = ['a', 'b'];
  const make = (name: string, a: number | null, b: number | null) => ({
    name,
    points: [
      { label: 'a', value: a },
      { label: 'b', value: b },
    ],
  });

  it('draws up to six series as given, in chart-1 to chart-6', () => {
    const shown = resolveSeries(
      Array.from({ length: 6 }, (_, i) => make(`S${i + 1}`, i, i)),
      labels,
      'Other',
    );
    expect(shown.map((s) => s.color)).toEqual([1, 2, 3, 4, 5, 6].map((n) => `var(--chart-${n})`));
    expect(shown.some((s) => s.merged)).toBe(false);
  });

  it('keeps the five highest by maximum and sums the rest into Other in chart-mid', () => {
    const shown = resolveSeries(
      [
        make('S1', 10, 10),
        make('S2', 80, 80),
        make('S3', 30, null),
        make('S4', 70, 70),
        make('S5', 20, 20),
        make('S6', 60, 60),
        make('S7', 50, 50),
        make('S8', 40, 40),
      ],
      labels,
      'Other',
    );
    expect(shown.map((s) => s.name)).toEqual(['S2', 'S4', 'S6', 'S7', 'S8', 'Other']);
    expect(shown.map((s) => s.color)).toEqual([1, 2, 3, 4, 5].map((n) => `var(--chart-${n})`).concat('var(--chart-mid)'));
    const other = shown[5];
    expect(other.merged).toBe(true);
    // S1 + S3 + S5 at a; S1 + S5 at b (a null adds nothing).
    expect(other.values).toEqual([60, 30]);
  });

  it('leaves Other null where every merged series is null', () => {
    const series = Array.from({ length: 7 }, (_, i) => make(`S${i}`, i === 0 ? null : 10 + i, 5));
    series[0] = make('S0', null, null);
    series[1] = make('S1', null, null);
    const shown = resolveSeries(series, labels, 'Other');
    expect(shown[5].values[0]).toBeNull();
  });

  it('treats missing and non-finite values as gaps, never zero', () => {
    const shown = resolveSeries([{ name: 'A', points: [{ label: 'a', value: Number.NaN }] }], labels, 'Other');
    expect(shown[0].values).toEqual([null, null]);
  });
});

describe('series styles', () => {
  it('uses circle, square, triangle, diamond, then the dashed four', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${styleAt(i).marker}${styleAt(i).dashed ? '-dashed' : ''}`)).toEqual([
      'circle',
      'square',
      'triangle',
      'diamond',
      'circle-dashed',
      'square-dashed',
      'triangle-dashed',
      'diamond-dashed',
    ]);
  });
});

describe('helpers', () => {
  it('splits runs at nulls', () => {
    expect(runsOf([1, null, 3, 4, null, null, 7])).toEqual([[0], [2, 3], [6]]);
    expect(runsOf([null, null])).toEqual([]);
  });

  it('formats shares', () => {
    expect(percentText(0)).toBe('0%');
    expect(percentText(0.5)).toBe('50%');
    expect(percentText(0.043)).toBe('4.3%');
    expect(percentText(0.0001)).toBe('<0.1%');
  });

  it('rounds shares together so they add up to exactly 100', () => {
    expect(percentTexts([1, 1, 1])).toEqual(['34%', '33%', '33%']);
    expect(percentTexts([25.5, 25.5, 25.5, 23.5])).toEqual(['26%', '26%', '25%', '23%']);
    // Mixed precision: whole percents from 10%, one decimal below.
    const mixed = percentTexts([61, 20, 12, 4.3, 2.4, 0.3]);
    expect(mixed.reduce((a, t) => a + Number.parseFloat(t), 0)).toBeCloseTo(100, 5);
    expect(mixed[0]).toMatch(/^\d+%$/);
    expect(mixed[3]).toMatch(/^\d\.\d%$/);
  });

  it('keeps zero and tiny shares out of the 100', () => {
    expect(percentTexts([0, 0])).toEqual(['0%', '0%']);
    expect(percentTexts([0, 10])).toEqual(['0%', '100%']);
    expect(percentTexts([1, 100000])).toEqual(['<0.1%', '100%']);
    expect(percentTexts([])).toEqual([]);
  });

  it('sums, averages and maxes over the real values only', () => {
    expect(sumCells([1, null, 4])).toBe(5);
    expect(sumCells([null, null])).toBeNull();
    expect(meanOf([2, null, 4])).toBe(3);
    expect(meanOf([null])).toBeNull();
    expect(maxOfCells([2, null, 9, 4])).toBe(9);
    expect(maxOfCells([])).toBeNull();
  });
});

describe('alignedScale', () => {
  it('gives exactly the requested number of ticks, so two axes share their gridlines', () => {
    for (const [lo, hi] of [
      [0, 100],
      [0, 99.9],
      [0, 1],
      [0, 7.3],
      [-5, 40],
      [0, 100000],
    ] as const) {
      for (const count of [4, 5]) {
        const scale = alignedScale(lo, hi, count);
        expect(scale.ticks, `${lo}..${hi} x${count}`).toHaveLength(count);
        expect(scale.min).toBeLessThanOrEqual(lo);
        expect(scale.max).toBeGreaterThanOrEqual(hi);
        const gaps = scale.ticks.slice(1).map((t, i) => Number((t - scale.ticks[i]).toFixed(8)));
        expect(new Set(gaps).size, 'equal steps').toBe(1);
      }
    }
  });

  it('splits the nice range into equal parts when no nice step gives that count', () => {
    const scale = alignedScale(0, 100, 6);
    expect(scale.ticks).toHaveLength(6);
    expect(scale.ticks[0]).toBe(0);
    expect(scale.ticks[5]).toBe(scale.max);
  });
});
