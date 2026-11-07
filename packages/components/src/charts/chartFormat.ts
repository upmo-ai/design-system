/**
 * Number formatting shared by the ECharts-backed charts: compact axis and legend
 * numbers, and a tidy rounding for computed figures (a mean) that go through a
 * caller's own formatter. Pure, so it is unit-tested on its own.
 */

const UNITS = ['', 'k', 'M', 'B', 'T'] as const;

function trim(n: number, digits: number): string {
  return String(Number(n.toFixed(digits)));
}

/** Below a thousand: at most three significant digits (999.4, 25, 6.5, 0.0012). */
function smallText(abs: number): string {
  if (abs >= 100) return trim(abs, 0);
  if (abs >= 10) return trim(abs, 1);
  if (abs >= 1) return trim(abs, 2);
  return String(Number(abs.toPrecision(2)));
}

/**
 * A short form of `n`: 536k, 2.3M, 1.2B. Below a thousand it keeps at most
 * three significant digits (6.5, 25, 0.0012). It never prints a long decimal.
 */
export function compactNumber(n: number): string {
  if (!Number.isFinite(n)) return '';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs < 1000) {
    if (abs === 0) return '0';
    // Round first, then choose the unit: 999.6 prints as 1k, not 1000.
    const text = smallText(abs);
    if (Number(text) < 1000) return sign + text;
    return `${sign}1k`;
  }
  let unit = Math.min(UNITS.length - 1, Math.floor(Math.log10(abs) / 3));
  let scaled = abs / 1000 ** unit;
  // One decimal below 100 of a unit, whole units from there; 999.6k carries into 1M.
  let rounded = scaled < 100 ? Math.round(scaled * 10) / 10 : Math.round(scaled);
  if (rounded >= 1000 && unit < UNITS.length - 1) {
    unit += 1;
    scaled = abs / 1000 ** unit;
    rounded = scaled < 100 ? Math.round(scaled * 10) / 10 : Math.round(scaled);
  }
  return `${sign}${rounded}${UNITS[unit]}`;
}

/**
 * Rounds a computed figure so a caller's formatter never has to print float
 * noise or a long fraction (536,440.143): whole numbers from a thousand, one
 * decimal from a hundred, two from one, three significant digits below.
 */
export function tidyNumber(n: number): number {
  if (!Number.isFinite(n)) return n;
  const abs = Math.abs(n);
  if (abs >= 1000) return Math.round(n);
  if (abs >= 100) return Number(n.toFixed(1));
  if (abs >= 1) return Number(n.toFixed(2));
  if (abs === 0) return 0;
  return Number(n.toPrecision(3));
}

/** Plain digits with a thousands separator and at most two decimals, for tooltips. */
export function groupedNumber(n: number): string {
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(n);
}

/** Axis tick text: the caller's formatter, else the compact form. */
export function tickFormatter(formatValue?: (n: number) => string): (n: number) => string {
  return formatValue ? (n) => formatValue(Number(n.toFixed(10))) : compactNumber;
}

/** Legend figures (a mean or a max): the caller's formatter on a tidy value, else the compact form. */
export function legendFormatter(formatValue?: (n: number) => string): (n: number) => string {
  return formatValue ? (n) => formatValue(tidyNumber(n)) : compactNumber;
}

/** Tooltip figures: the caller's formatter, else grouped digits. */
export function tooltipFormatter(formatValue?: (n: number) => string): (n: number) => string {
  return formatValue ?? groupedNumber;
}

/** Escapes text for the HTML an ECharts tooltip formatter returns. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
