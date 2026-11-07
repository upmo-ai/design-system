import { describe, expect, it } from 'vitest';
import {
  compactNumber,
  escapeHtml,
  groupedNumber,
  legendFormatter,
  tickFormatter,
  tidyNumber,
  tooltipFormatter,
} from '../src/charts/chartFormat.ts';

describe('compactNumber', () => {
  it('uses k, M and B', () => {
    expect(compactNumber(536_440.143)).toBe('536k');
    expect(compactNumber(2_300_000)).toBe('2.3M');
    expect(compactNumber(1_200_000_000)).toBe('1.2B');
    expect(compactNumber(1000)).toBe('1k');
    expect(compactNumber(12_500)).toBe('12.5k');
    expect(compactNumber(999_999)).toBe('1M');
    expect(compactNumber(4_000_000_000_000)).toBe('4T');
  });

  it('rounds before it picks the unit, so a boundary value never reads 1000', () => {
    // Below a thousand: 999.4 stays 999, 999.6 is a thousand.
    expect(compactNumber(999)).toBe('999');
    expect(compactNumber(999.4)).toBe('999');
    expect(compactNumber(999.5)).toBe('1k');
    expect(compactNumber(999.6)).toBe('1k');
    expect(compactNumber(999.99)).toBe('1k');
    expect(compactNumber(-999.6)).toBe('-1k');
    expect(compactNumber(-999.4)).toBe('-999');
    // k to M.
    expect(compactNumber(999_499)).toBe('999k');
    expect(compactNumber(999_500)).toBe('1M');
    expect(compactNumber(999_600)).toBe('1M');
    // M to B.
    expect(compactNumber(999_499_999)).toBe('999M');
    expect(compactNumber(999_500_000)).toBe('1B');
    expect(compactNumber(999_600_000)).toBe('1B');
    // B to T.
    expect(compactNumber(999_499_999_999)).toBe('999B');
    expect(compactNumber(999_500_000_000)).toBe('1T');
    expect(compactNumber(999_600_000_000)).toBe('1T');
    // No output ever reads 1000 of a unit.
    for (const n of [999.5, 999.9, 999_500, 999_999, 999_999_999, 999_999_999_999]) {
      expect(compactNumber(n)).not.toMatch(/^1000/);
    }
  });

  it('keeps small numbers short and never prints a long decimal', () => {
    expect(compactNumber(0)).toBe('0');
    expect(compactNumber(6.5)).toBe('6.5');
    expect(compactNumber(25)).toBe('25');
    expect(compactNumber(25.456)).toBe('25.5');
    expect(compactNumber(123.456)).toBe('123');
    expect(compactNumber(0.0012345)).toBe('0.0012');
    expect(compactNumber(0.1 + 0.2)).toBe('0.3');
    for (const n of [536_440.143, 3.14159265, 1234.5678, 0.333333333, 98_765_432.1]) {
      expect(compactNumber(n)).not.toMatch(/\.\d{3,}/);
    }
  });

  it('keeps the sign and ignores non-finite input', () => {
    expect(compactNumber(-536_440.143)).toBe('-536k');
    expect(compactNumber(-2.5)).toBe('-2.5');
    expect(compactNumber(Number.NaN)).toBe('');
    expect(compactNumber(Number.POSITIVE_INFINITY)).toBe('');
  });
});

describe('tidyNumber', () => {
  it('rounds a computed figure before it reaches a caller formatter', () => {
    expect(tidyNumber(536_440.143)).toBe(536_440);
    expect(tidyNumber(123.456)).toBe(123.5);
    expect(tidyNumber(6.5000001)).toBe(6.5);
    expect(tidyNumber(0.123456)).toBe(0.123);
    expect(tidyNumber(0)).toBe(0);
  });
});

describe('formatters', () => {
  it('uses the compact form for ticks and legend figures when the caller gave none', () => {
    expect(tickFormatter()(2_300_000)).toBe('2.3M');
    expect(legendFormatter()(536_440.143)).toBe('536k');
  });

  it("uses the caller's formatter, on a tidy value in the legend", () => {
    const money = (n: number) => `$${n}`;
    expect(legendFormatter(money)(536_440.143)).toBe('$536440');
    expect(tickFormatter(money)(0.1 + 0.2)).toBe('$0.3');
    expect(tooltipFormatter(money)(12.5)).toBe('$12.5');
  });

  it('groups digits in the tooltip by default', () => {
    expect(tooltipFormatter()(1234567.891)).toBe('1,234,567.89');
    expect(groupedNumber(12)).toBe('12');
  });

  it('escapes html', () => {
    expect(escapeHtml(`<b onclick="x">'&'</b>`)).toBe('&lt;b onclick=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;');
  });
});
