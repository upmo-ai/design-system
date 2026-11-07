/**
 * Token-driven theming for the ECharts-backed charts. ECharts paints SVG
 * attributes, not CSS, so the token variables are read at runtime from the
 * chart's own element (where the active [data-theme] scope applies) and handed
 * over as resolved colour strings. Nothing here hard-codes a colour value for
 * a theme: change a token or the theme and the next read follows.
 */

/** The values an option builder needs, read once per theme change. */
export interface ChartTheme {
  /** Resolved chart tokens by variable name: --chart-1 to --chart-6 and --chart-mid. */
  colors: Readonly<Record<string, string>>;
  ink: string;
  inkMuted: string;
  border: string;
  borderStrong: string;
  /** The ground a chart sits on (surface-100); slice gaps and symbol rings use it. */
  surface: string;
  surfaceHover: string;
  fontFamily: string;
  /** Caption size in px: axis labels. */
  fontSize: number;
  /** Body-sm size in px: tooltip text. */
  bodySize: number;
  /** High contrast, forced colours or the hc theme: add decals, symbols and dashes. */
  contrast: boolean;
  reducedMotion: boolean;
}

const COLOR_VARS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6', '--chart-mid'] as const;

// Used only when the token stylesheet is not loaded, so a chart still draws.
const FALLBACK = {
  series: 'rgb(110, 118, 129)',
  ink: 'rgb(24, 26, 29)',
  muted: 'rgb(96, 104, 114)',
  border: 'rgb(219, 222, 228)',
  borderStrong: 'rgb(140, 146, 156)',
  surface: 'rgb(255, 255, 255)',
  hover: 'rgb(241, 242, 244)',
  font: 'system-ui, sans-serif',
} as const;

/** Reads a custom property as the browser resolved it for `el`, walking up when the engine does not inherit it. */
function readVar(el: Element, name: string): string {
  let node: Element | null = el;
  while (node) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    if (value) return value;
    node = node.parentElement;
  }
  return '';
}

function toPx(value: string, fallback: number, root: Element): number {
  const match = /^(-?\d*\.?\d+)(px|rem)?$/.exec(value);
  if (!match) return fallback;
  const n = Number(match[1]);
  if (match[2] === 'rem') {
    const base = Number.parseFloat(getComputedStyle(root).fontSize);
    return n * (Number.isFinite(base) ? base : 16);
  }
  return n;
}

function matches(query: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

/** True when colour must not carry meaning alone. */
export function prefersContrast(el: Element): boolean {
  return (
    matches('(prefers-contrast: more)') ||
    matches('(forced-colors: active)') ||
    el.closest('[data-theme]')?.getAttribute('data-theme') === 'hc'
  );
}

/**
 * True when motion should be off: the OS setting or the in-app one on the root.
 * Safe without a DOM (a server render, plain node): it is then false.
 */
export function prefersReducedMotion(): boolean {
  return (
    matches('(prefers-reduced-motion: reduce)') ||
    (typeof document !== 'undefined' &&
      document.documentElement?.getAttribute('data-reduced-motion') === 'reduce')
  );
}

/** Builds the theme from the token variables in effect at `el`. */
export function readChartTheme(el: Element): ChartTheme {
  const root = document.documentElement;
  const colors: Record<string, string> = {};
  for (const name of COLOR_VARS) colors[name] = readVar(el, name) || FALLBACK.series;
  return {
    colors,
    ink: readVar(el, '--ink') || FALLBACK.ink,
    inkMuted: readVar(el, '--ink-muted') || FALLBACK.muted,
    border: readVar(el, '--border') || FALLBACK.border,
    borderStrong: readVar(el, '--border-strong') || FALLBACK.borderStrong,
    surface: readVar(el, '--surface-100') || FALLBACK.surface,
    surfaceHover: readVar(el, '--surface-hover') || FALLBACK.hover,
    fontFamily: readVar(el, '--font-ui') || FALLBACK.font,
    fontSize: toPx(readVar(el, '--text-caption-size'), 12, root),
    bodySize: toPx(readVar(el, '--text-body-sm-size'), 13, root),
    contrast: prefersContrast(el),
    reducedMotion: prefersReducedMotion(),
  };
}

/** A stable string for comparing two themes. */
export function themeKey(theme: ChartTheme): string {
  return JSON.stringify(theme);
}

/** Maps a `var(--chart-N)` token reference to its resolved colour; other strings pass through. */
export function paint(theme: ChartTheme, value: string): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value);
  return match ? (theme.colors[match[1]] ?? value) : value;
}

/**
 * `color` at `alpha` (0 to 1). Hex and rgb() colours are converted; anything
 * else (a token that resolves to a colour function) falls back to color-mix.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{3,8})$/i.exec(color.trim());
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length === 6 || h.length === 8) {
      const base = h.length === 8 ? Number.parseInt(h.slice(6), 16) / 255 : 1;
      const r = Number.parseInt(h.slice(0, 2), 16);
      const g = Number.parseInt(h.slice(2, 4), 16);
      const b = Number.parseInt(h.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${Number((alpha * base).toFixed(3))})`;
    }
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(color.trim());
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

const WATCHED_ATTRIBUTES = ['data-theme', 'data-mantine-color-scheme', 'data-reduced-motion', 'class', 'style'];
const WATCHED_QUERIES = [
  '(prefers-color-scheme: dark)',
  '(prefers-contrast: more)',
  '(forced-colors: active)',
  '(prefers-reduced-motion: reduce)',
];

/**
 * Calls `onChange` when something that can change the theme changes: the
 * data-theme attribute or class on the root or on the nearest themed ancestor,
 * or one of the media queries the charts follow. The caller decides whether the
 * resolved theme really differs (themeKey), since class and style change often.
 */
export function observeChartTheme(el: Element, onChange: () => void): () => void {
  const cleanups: (() => void)[] = [];

  const targets = new Set<Element>([document.documentElement]);
  const scoped = el.closest('[data-theme]');
  if (scoped) targets.add(scoped);
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(onChange);
    for (const target of targets) observer.observe(target, { attributes: true, attributeFilter: WATCHED_ATTRIBUTES });
    cleanups.push(() => observer.disconnect());
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    for (const query of WATCHED_QUERIES) {
      const list = window.matchMedia(query);
      list.addEventListener?.('change', onChange);
      cleanups.push(() => list.removeEventListener?.('change', onChange));
    }
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
