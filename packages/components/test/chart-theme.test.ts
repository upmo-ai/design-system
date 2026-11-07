import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  observeChartTheme,
  paint,
  prefersContrast,
  prefersReducedMotion,
  readChartTheme,
  themeKey,
  withAlpha,
} from '../src/charts/chartTheme.ts';

let style: HTMLStyleElement;

beforeEach(() => {
  style = document.createElement('style');
  style.textContent = `
    :root { --chart-1: rgb(1, 2, 3); --chart-mid: rgb(9, 9, 9); --ink: rgb(10, 10, 10); --ink-muted: rgb(20, 20, 20);
      --border: rgb(30, 30, 30); --surface-100: rgb(250, 250, 250); --font-ui: Inter, sans-serif;
      --text-caption-size: 0.75rem; --text-body-sm-size: 13px; }
    [data-theme='dark'] { --chart-1: rgb(4, 5, 6); --ink: rgb(240, 240, 240); }
  `;
  document.head.append(style);
});

afterEach(() => {
  style.remove();
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-reduced-motion');
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
});

function mount(theme?: string) {
  const outer = document.createElement('div');
  if (theme) outer.setAttribute('data-theme', theme);
  const inner = document.createElement('div');
  outer.append(inner);
  document.body.append(outer);
  return { outer, inner };
}

function stubMedia(matching: string[]) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe('readChartTheme', () => {
  it('reads the token variables in effect at the element', () => {
    const { inner } = mount();
    const theme = readChartTheme(inner);
    expect(theme.colors['--chart-1']).toBe('rgb(1, 2, 3)');
    expect(theme.colors['--chart-mid']).toBe('rgb(9, 9, 9)');
    expect(theme.ink).toBe('rgb(10, 10, 10)');
    expect(theme.inkMuted).toBe('rgb(20, 20, 20)');
    expect(theme.surface).toBe('rgb(250, 250, 250)');
    expect(theme.fontFamily).toBe('Inter, sans-serif');
    expect(theme.bodySize).toBe(13);
  });

  it('follows a themed ancestor, so dark tokens apply inside data-theme="dark"', () => {
    const { inner } = mount('dark');
    const theme = readChartTheme(inner);
    expect(theme.colors['--chart-1']).toBe('rgb(4, 5, 6)');
    expect(theme.ink).toBe('rgb(240, 240, 240)');
    expect(themeKey(theme)).not.toBe(themeKey(readChartTheme(mount().inner)));
  });

  it('converts rem sizes with the root font size', () => {
    const { inner } = mount();
    document.documentElement.style.fontSize = '20px';
    try {
      expect(readChartTheme(inner).fontSize).toBe(15);
    } finally {
      document.documentElement.style.fontSize = '';
    }
  });

  it('falls back to a plain colour when the token stylesheet is not loaded', () => {
    style.remove();
    const theme = readChartTheme(mount().inner);
    expect(theme.colors['--chart-3']).toMatch(/^rgb\(/);
    expect(theme.fontSize).toBe(12);
  });
});

describe('contrast and motion', () => {
  it('is on for the hc theme, prefers-contrast and forced colours, and off otherwise', () => {
    expect(prefersContrast(mount().inner)).toBe(false);
    expect(prefersContrast(mount('hc').inner)).toBe(true);
    stubMedia(['(prefers-contrast: more)']);
    expect(prefersContrast(mount().inner)).toBe(true);
    stubMedia(['(forced-colors: active)']);
    expect(prefersContrast(mount().inner)).toBe(true);
  });

  it('reads forced colours into the theme as contrast, with no other signal set', () => {
    expect(readChartTheme(mount().inner).contrast).toBe(false);
    stubMedia(['(forced-colors: active)']);
    expect(readChartTheme(mount().inner).contrast).toBe(true);
    stubMedia(['(prefers-contrast: more)']);
    expect(readChartTheme(mount().inner).contrast).toBe(true);
    stubMedia([]);
    expect(readChartTheme(mount('hc').inner).contrast).toBe(true);
  });

  it('turns motion off for the OS setting and for the in-app one', () => {
    expect(prefersReducedMotion()).toBe(false);
    stubMedia(['(prefers-reduced-motion: reduce)']);
    expect(prefersReducedMotion()).toBe(true);
    stubMedia([]);
    document.documentElement.setAttribute('data-reduced-motion', 'reduce');
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('colour helpers', () => {
  it('paints a var(--chart-N) reference with the resolved token and passes other strings through', () => {
    const theme = readChartTheme(mount().inner);
    expect(paint(theme, 'var(--chart-1)')).toBe('rgb(1, 2, 3)');
    expect(paint(theme, 'var(--chart-mid)')).toBe('rgb(9, 9, 9)');
    expect(paint(theme, 'var(--nope)')).toBe('var(--nope)');
    expect(paint(theme, 'rgb(5, 5, 5)')).toBe('rgb(5, 5, 5)');
  });

  it('applies an alpha to hex, rgb and other colours', () => {
    expect(withAlpha('#ff0000', 0.25)).toBe('rgba(255, 0, 0, 0.25)');
    expect(withAlpha('#f00', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    expect(withAlpha('rgb(1, 2, 3)', 0.4)).toBe('rgba(1, 2, 3, 0.4)');
    expect(withAlpha('rgba(1, 2, 3, 0.9)', 0.1)).toBe('rgba(1, 2, 3, 0.1)');
    expect(withAlpha('oklch(0.7 0.1 150)', 0.25)).toBe('color-mix(in srgb, oklch(0.7 0.1 150) 25%, transparent)');
  });
});

describe('observeChartTheme', () => {
  it('calls back when data-theme changes on the root or on the themed ancestor, and stops after cleanup', async () => {
    const { outer, inner } = mount('light');
    const onChange = vi.fn();
    const stop = observeChartTheme(inner, onChange);

    outer.setAttribute('data-theme', 'dark');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

    document.documentElement.setAttribute('data-theme', 'hc');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    document.documentElement.removeAttribute('data-theme');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(3));

    stop();
    outer.setAttribute('data-theme', 'light');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('listens to the colour scheme, contrast, forced colours and motion queries', () => {
    const lists: { query: string; add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal('matchMedia', (query: string) => {
      const entry = { query, add: vi.fn(), remove: vi.fn() };
      lists.push(entry);
      return { matches: false, media: query, addEventListener: entry.add, removeEventListener: entry.remove };
    });
    const stop = observeChartTheme(mount().inner, () => {});
    expect(lists.map((l) => l.query).sort()).toEqual(
      [
        '(forced-colors: active)',
        '(prefers-color-scheme: dark)',
        '(prefers-contrast: more)',
        '(prefers-reduced-motion: reduce)',
      ].sort(),
    );
    for (const l of lists) expect(l.add).toHaveBeenCalledWith('change', expect.any(Function));
    stop();
    for (const l of lists) expect(l.remove).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
