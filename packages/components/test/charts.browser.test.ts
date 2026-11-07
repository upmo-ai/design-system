// @vitest-environment node
//
// The four ECharts-backed charts in a real browser. jsdom has no layout, so
// whether the drawing exists and has a size, whether hovering shows the tooltip
// with every series, whether the legend hides a series, and how the charts look
// in high contrast can only be seen in Chromium. The unit tests cover the same
// behaviour against a fake ECharts; this suite uses the real one.
//
// Opt-in like the other browser suites: `pnpm --filter @upmo-ai/components
// test:browser` sets UPMO_REQUIRE_BROWSER=1 and runs it in Playwright's image:
//   docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.61.1-noble \
//     sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @upmo-ai/components test:browser"
import axe from 'axe-core';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.UPMO_REQUIRE_BROWSER === '1';
if (enabled && !existsSync(chromium.executablePath())) {
  throw new Error(`Chromium not found at ${chromium.executablePath()}; run this in the Playwright image.`);
}

const tokens = JSON.parse(readFileSync(resolve(__dirname, '../../tokens/tokens.json'), 'utf8'));
const tokenValue = (name: string, theme: 'light' | 'dark' | 'hc') => {
  const entry = tokens.color.tokens.find((t: { name: string }) => t.name === name);
  return (entry.value as Record<string, string>)[theme];
};
const chartColour = (n: number, theme: 'light' | 'dark' | 'hc') => tokenValue(`chart-${n}`, theme);

type Theme = 'light' | 'dark' | 'hc';

const LINE = 'Tokens per day';
const DONUT = 'Runs by model';
const BARS = 'Run outcomes per day';
const COMBO = 'Runs and success rate';

describe.skipIf(!enabled)('ECharts-backed charts in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/charts-entry.tsx')],
      bundle: true,
      write: false,
      outdir: 'out',
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      minify: true,
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
    });
    js = result.outputFiles.find((f) => f.path.endsWith('.js'))!.text;
    css = result.outputFiles.find((f) => f.path.endsWith('.css'))!.text;
    browser = await chromium.launch();
  }, 120_000);

  afterAll(async () => {
    await browser?.close();
  });

  /** Opens the fixture page with all four charts drawn, then runs `run`. */
  async function withCharts<T>(
    options: { theme?: Theme; context?: BrowserContextOptions; hidden?: boolean },
    run: (page: Page) => Promise<T>,
  ) {
    const context = await browser.newContext({
      viewport: { width: 700, height: 1800 },
      reducedMotion: 'reduce',
      ...options.context,
    });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body style="margin:0"><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.evaluate(
        ({ theme, hidden }) => {
          const w = window as unknown as { __CHART_THEME__: string; __CHARTS_HIDDEN__: boolean };
          w.__CHART_THEME__ = theme;
          w.__CHARTS_HIDDEN__ = hidden;
        },
        { theme: options.theme ?? 'light', hidden: options.hidden ?? false },
      );
      await page.addScriptTag({ content: js });
      // A hidden fixture is not visible, only attached.
      await page
        .locator('[data-chart-ready="true"]')
        .nth(3)
        .waitFor({ state: options.hidden ? 'attached' : 'visible', timeout: 20_000 });
      return await run(page);
    } finally {
      await context.close();
    }
  }

  const figure = (page: Page, name: string) => page.getByRole('group', { name, exact: true });
  const plot = (page: Page, name: string) => figure(page, name).locator('.upmo-chart__plot');

  /** Moves the mouse to a fraction of a chart's plot. */
  async function hover(page: Page, name: string, fx: number, fy: number) {
    const box = await plot(page, name).boundingBox();
    if (!box) throw new Error(`${name} has no plot`);
    await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 4 });
  }

  /** The rows of the tooltip that is showing in a chart, as [name, value]. */
  async function tooltip(page: Page, name: string) {
    const tip = figure(page, name).locator('.upmo-chart__tip');
    await tip.first().waitFor({ state: 'visible', timeout: 5000 });
    return tip.first().evaluate((el) => ({
      title: el.querySelector('.upmo-chart__tip-title')?.textContent ?? null,
      rows: [...el.querySelectorAll('.upmo-chart__tip-row')].map((row) => [
        row.querySelector('.upmo-chart__tip-name')?.textContent ?? '',
        row.querySelector('.upmo-chart__tip-value')?.textContent ?? '',
      ]),
    }));
  }

  const numberOf = (text: string) => Number(text.replace(/[^0-9.-]/g, ''));

  describe('drawing', () => {
    it('draws an svg with a size in each chart, hidden from assistive technology', async () => {
      await withCharts({}, async (page) => {
        for (const name of [LINE, DONUT, BARS, COMBO]) {
          const svg = plot(page, name).locator('svg').first();
          expect(await svg.count(), name).toBe(1);
          const box = await svg.boundingBox();
          expect(box!.width, name).toBeGreaterThan(150);
          expect(box!.height, name).toBeGreaterThan(150);
          expect(await plot(page, name).getAttribute('aria-hidden'), name).toBe('true');
          expect(await plot(page, name).getAttribute('data-chart-ready'), name).toBe('true');
        }
      });
    });

    it('holds the plot height while ECharts loads, so nothing jumps', async () => {
      await withCharts({}, async (page) => {
        const before = await page.evaluate(() => window.__chartStats!.heightsBefore);
        const after = await page.evaluate(() =>
          [...document.querySelectorAll('.upmo-chart__plot')].map((el) => el.getBoundingClientRect().height),
        );
        expect(before).toHaveLength(4);
        expect(after).toEqual(before);
        expect(before.every((h) => h > 100)).toBe(true);
      });
    });

    it('draws its first chart quickly and reports the time', async () => {
      await withCharts({}, async (page) => {
        await page.waitForFunction(() => window.__chartStats!.firstPaint !== null);
        const stats = await page.evaluate(() => {
          const s = window.__chartStats!;
          return { firstReady: s.firstReady, allReady: s.allReady, firstPaint: s.firstPaint };
        });
        // Not a benchmark, only a guard against something pathological. The figures
        // include evaluating the inlined ECharts code, which an app gets as a lazy chunk.
        console.info(
          `first chart drawn ${stats.firstReady?.toFixed(0)} ms, first paint ${stats.firstPaint?.toFixed(0)} ms, all four drawn ${stats.allReady?.toFixed(0)} ms`,
        );
        expect(stats.firstReady).not.toBeNull();
        expect(stats.firstReady!).toBeLessThan(5000);
        expect(stats.allReady!).toBeLessThan(8000);
      });
    });

    it('follows its container when the viewport narrows', async () => {
      await withCharts({}, async (page) => {
        const before = (await plot(page, LINE).locator('svg').first().boundingBox())!.width;
        await page.setViewportSize({ width: 360, height: 1800 });
        await page.waitForFunction(
          (w) => document.querySelector('.upmo-chart__plot svg')!.getBoundingClientRect().width < w - 50,
          before,
          { timeout: 5000 },
        );
        const after = (await plot(page, LINE).locator('svg').first().boundingBox())!.width;
        expect(after).toBeLessThan(before);
      });
    });
  });

  describe('hidden host', () => {
    // getByRole skips hidden elements, so these find the plot by its label.
    const hostPlot = (page: Page, name: string) => page.locator(`[aria-label="${name}"] .upmo-chart__plot`);
    const svgSize = (page: Page, name: string) =>
      hostPlot(page, name)
        .locator('svg')
        .first()
        .evaluate((el) => ({ attr: Number(el.getAttribute('width')), box: el.getBoundingClientRect().width }));
    const plotWidth = (page: Page, name: string) => hostPlot(page, name).evaluate((el) => el.getBoundingClientRect().width);
    const frames = (page: Page) =>
      page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));

    it('keeps the drawing while the host is display: none, and draws at the right size when it is shown', async () => {
      await withCharts({}, async (page) => {
        const messages: string[] = [];
        page.on('console', (m) => {
          if (m.type() === 'warning' || m.type() === 'error') messages.push(m.text());
        });
        page.on('pageerror', (e) => messages.push(String(e)));

        const before = await svgSize(page, LINE);
        expect(before.attr).toBeGreaterThan(150);

        await page.evaluate(() => (document.getElementById('chart-grid')!.style.display = 'none'));
        await frames(page);
        await frames(page);
        // The observer has fired with a 0 x 0 box. The chart must not have been resized to it.
        expect((await svgSize(page, LINE)).attr).toBe(before.attr);
        expect((await svgSize(page, COMBO)).attr).toBeGreaterThan(150);

        // Shown again, narrower than before: the observer fires with a real size.
        await page.evaluate(() => {
          const grid = document.getElementById('chart-grid')!;
          grid.style.maxWidth = '400px';
          grid.style.display = 'grid';
        });
        for (const name of [LINE, DONUT, BARS, COMBO]) {
          await expect
            .poll(async () => {
              const [svg, host] = [await svgSize(page, name), await plotWidth(page, name)];
              return Math.abs(svg.box - host) < 1.5 && svg.box > 150 && svg.box < before.attr;
            }, { message: name })
            .toBe(true);
        }
        expect(messages).toEqual([]);
      });
    });

    it('draws a chart that was mounted in a display: none box once the box is shown', async () => {
      await withCharts({ hidden: true }, async (page) => {
        await page.evaluate(() => (document.getElementById('chart-grid')!.style.display = 'grid'));
        for (const name of [LINE, DONUT, BARS, COMBO]) {
          await expect
            .poll(async () => {
              const [svg, host] = [await svgSize(page, name), await plotWidth(page, name)];
              return Math.abs(svg.box - host) < 1.5 && svg.box > 150;
            }, { message: name })
            .toBe(true);
          expect(await hostPlot(page, name).getAttribute('data-chart-ready'), name).toBe('true');
        }
        // Drawn, not just sized: the line chart has its series paths.
        expect(await hostPlot(page, LINE).locator('svg path').count()).toBeGreaterThan(3);
      });
    });
  });

  describe('tooltip', () => {
    it('shows every series of the line chart with a value, largest first', async () => {
      await withCharts({}, async (page) => {
        await hover(page, LINE, 0.5, 0.4);
        const tip = await tooltip(page, LINE);
        expect(tip.title).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
        const names = tip.rows.map((r) => r[0]);
        expect(names).toContain('Input');
        expect(names).toContain('Tool definitions');
        expect(tip.rows.every((r) => / tok$|^No data$/.test(r[1]))).toBe(true);
        const values = tip.rows.filter((r) => r[1] !== 'No data').map((r) => numberOf(r[1]));
        expect(values).toEqual([...values].sort((a, b) => b - a));
        expect(tip.rows.length).toBe(3);
      });
    });

    it('shows the slice, its value and its share on the donut', async () => {
      await withCharts({}, async (page) => {
        const box = (await plot(page, DONUT).boundingBox())!;
        const radius = Math.min(box.width, box.height) / 2;
        // The right-hand side of the ring, in its thick part: the first slice runs from the top, clockwise.
        await page.mouse.move(box.x + box.width / 2 + radius * 0.77, box.y + box.height / 2, { steps: 4 });
        const tip = await tooltip(page, DONUT);
        expect(tip.title).toBe('Claude Sonnet');
        expect(tip.rows).toHaveLength(1);
        expect(tip.rows[0][1]).toBe('640 runs');
        expect(tip.rows[0][0]).toMatch(/%$/);
      });
    });

    it('shows every bar of a group on the grouped bar chart', async () => {
      await withCharts({}, async (page) => {
        await hover(page, BARS, 0.5, 0.5);
        const tip = await tooltip(page, BARS);
        expect(tip.rows.map((r) => r[0])).toEqual(['Passed', 'Failed', 'Cancelled']);
      });
    });

    it('shows both values on the combo chart, bars first', async () => {
      await withCharts({}, async (page) => {
        await hover(page, COMBO, 0.5, 0.5);
        const tip = await tooltip(page, COMBO);
        expect(tip.rows.map((r) => r[0])).toEqual(['Runs', 'Success rate']);
        expect(tip.rows[1][1]).toMatch(/%$/);
      });
    });

    it('stays inside the chart: it is confined to its box', async () => {
      await withCharts({}, async (page) => {
        await hover(page, LINE, 0.98, 0.3);
        await tooltip(page, LINE);
        const fits = await page.evaluate(() => {
          const tip = document.querySelector('.upmo-chart__tip')!.getBoundingClientRect();
          return tip.right <= document.documentElement.clientWidth && tip.left >= 0;
        });
        expect(fits).toBe(true);
      });
    });
  });

  describe('legend', () => {
    it('hides a series on click and shows it again, and the tooltip follows', async () => {
      await withCharts({}, async (page) => {
        const legend = figure(page, LINE).getByRole('list', { name: `${LINE} series` });
        const output = legend.getByRole('button', { name: 'Output' });
        expect(await output.getAttribute('aria-pressed')).toBe('true');

        await output.click();
        await expect.poll(() => output.getAttribute('aria-pressed')).toBe('false');
        await hover(page, LINE, 0.5, 0.4);
        expect((await tooltip(page, LINE)).rows.map((r) => r[0])).not.toContain('Output');

        await output.click();
        await expect.poll(() => output.getAttribute('aria-pressed')).toBe('true');
        await page.mouse.move(0, 0);
        await hover(page, LINE, 0.55, 0.4);
        await expect
          .poll(async () => (await tooltip(page, LINE)).rows.map((r) => r[0]))
          .toContain('Output');
      });
    });

    it('works from the keyboard with Enter and Space', async () => {
      await withCharts({}, async (page) => {
        const legend = figure(page, BARS).getByRole('list', { name: `${BARS} bars` });
        const failed = legend.getByRole('button', { name: 'Failed' });
        await failed.focus();
        await page.keyboard.press('Enter');
        await expect.poll(() => failed.getAttribute('aria-pressed')).toBe('false');
        await page.keyboard.press('Space');
        await expect.poll(() => failed.getAttribute('aria-pressed')).toBe('true');
      });
    });

    it('hides a donut slice and recomputes the centre total', async () => {
      await withCharts({}, async (page) => {
        const centre = figure(page, DONUT).locator('.upmo-donut__center-value');
        expect(await centre.textContent()).toBe('1284');
        await figure(page, DONUT).getByRole('button', { name: /^Claude Sonnet/ }).click();
        await expect.poll(() => centre.textContent()).toBe('644');
      });
    });

    it('keeps one series: the last visible item cannot be hidden', async () => {
      await withCharts({}, async (page) => {
        const legend = figure(page, COMBO).getByRole('list', { name: `${COMBO} series` });
        await legend.getByRole('button', { name: 'Runs' }).click();
        const rate = legend.getByRole('button', { name: 'Success rate' });
        await expect.poll(() => legend.getByRole('button', { name: 'Runs' }).getAttribute('aria-pressed')).toBe('false');
        // aria-disabled makes Playwright wait for it to be enabled; the click itself must do nothing.
        await rate.click({ force: true });
        expect(await rate.getAttribute('aria-pressed')).toBe('true');
        expect(await rate.getAttribute('aria-disabled')).toBe('true');
      });
    });
  });

  describe('keyboard', () => {
    it('steps along the chart with the arrow keys, showing the tooltip and the readout', async () => {
      await withCharts({}, async (page) => {
        const line = figure(page, LINE);
        await line.focus();
        const readout = line.locator('.upmo-chart__readout');
        await expect.poll(() => readout.textContent()).toBe('Mon: Input 1,200 tok, Output 600 tok, Tool definitions 200 tok');
        await expect.poll(async () => (await tooltip(page, LINE)).title).toBe('Mon');
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => readout.textContent()).toContain('Tue:');
        await expect.poll(async () => (await tooltip(page, LINE)).title).toBe('Tue');
        await page.keyboard.press('End');
        await expect.poll(async () => (await tooltip(page, LINE)).title).toBe('Sun');
        await page.keyboard.press('Escape');
        await expect.poll(() => readout.textContent()).toBe('');
        await expect.poll(() => line.locator('.upmo-chart__tip').first().isVisible()).toBe(false);
      });
    });

    it('shows a visible focus ring on the chart', async () => {
      await withCharts({}, async (page) => {
        // The first tab stop on the page is the line chart.
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement!;
          const style = getComputedStyle(el);
          return { label: el.getAttribute('aria-label'), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
        });
        expect(focused).toEqual({ label: LINE, outlineStyle: 'solid', outlineWidth: '2px' });
      });
    });
  });

  describe('theme', () => {
    const strokes = (page: Page) =>
      plot(page, LINE).evaluate((el) => {
        const probe = document.createElement('span');
        document.body.append(probe);
        const normalise = (c: string) => {
          probe.style.color = '';
          probe.style.color = c;
          return getComputedStyle(probe).color;
        };
        const out = new Set<string>();
        for (const node of el.querySelectorAll('svg path')) {
          const stroke = node.getAttribute('stroke');
          if (stroke && stroke !== 'none') out.add(normalise(stroke));
        }
        probe.remove();
        return [...out];
      });
    const normal = (page: Page, colour: string) =>
      page.evaluate((c) => {
        const probe = document.createElement('span');
        document.body.append(probe);
        probe.style.color = c;
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, colour);

    it('draws the lines in the chart tokens of the theme', async () => {
      for (const theme of ['light', 'dark'] as const) {
        await withCharts({ theme }, async (page) => {
          const drawn = await strokes(page);
          for (const n of [1, 2, 3]) expect(drawn, `${theme} chart-${n}`).toContain(await normal(page, chartColour(n, theme)));
        });
      }
    });

    it('redraws with the new tokens when the theme changes under it', async () => {
      await withCharts({ theme: 'light' }, async (page) => {
        const light1 = await normal(page, chartColour(1, 'light'));
        const dark1 = await normal(page, chartColour(1, 'dark'));
        expect(await strokes(page)).toContain(light1);
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await expect.poll(() => strokes(page)).toContain(dark1);
        expect(await strokes(page)).not.toContain(light1);
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        await expect.poll(() => strokes(page)).toContain(light1);
      });
    });

    it('paints the tooltip in the surface and ink tokens', async () => {
      await withCharts({ theme: 'dark' }, async (page) => {
        await hover(page, LINE, 0.5, 0.4);
        await tooltip(page, LINE);
        const colours = await figure(page, LINE).locator('.upmo-chart__tooltip').first().evaluate((el) => {
          const style = getComputedStyle(el);
          return { background: style.backgroundColor };
        });
        expect(colours.background).toBe(await normal(page, tokens.color.tokens.find((t: { name: string }) => t.name === 'surface-100').value.dark));
      });
    });
  });

  describe('theme switch', () => {
    /** Every colour a theme paints into the line chart's svg, tooltip and legend, resolved to rgb(). */
    const paints = (page: Page) =>
      figure(page, LINE).evaluate((fig) => {
        const probe = document.createElement('span');
        document.body.append(probe);
        const rgb = (c: string | null | undefined) => {
          probe.style.color = '';
          probe.style.color = c ?? '';
          return c ? getComputedStyle(probe).color : '';
        };
        const svg = fig.querySelector('.upmo-chart__plot svg')!;
        const texts = [...svg.querySelectorAll('text')];
        const fillOf = (match: (t: string) => boolean) => {
          const el = texts.find((t) => match(t.textContent ?? ''));
          return el ? rgb(el.getAttribute('fill') ?? getComputedStyle(el).fill) : '';
        };
        const strokes = new Set<string>();
        for (const node of svg.querySelectorAll('path')) {
          const stroke = node.getAttribute('stroke');
          if (stroke && stroke !== 'none') strokes.add(rgb(stroke));
        }
        const dot = fig.querySelector('.upmo-chart__legend-list .upmo-chart__dot') as HTMLElement;
        const statValue = fig.querySelector('.upmo-chart__legend-stat-value') as HTMLElement;
        const out = {
          xLabel: fillOf((t) => t === 'Mon'),
          yLabel: fillOf((t) => /^\d/.test(t)),
          strokes: [...strokes],
          legendDot: getComputedStyle(dot).backgroundColor,
          legendValue: getComputedStyle(statValue).color,
        };
        probe.remove();
        return out;
      });

    const rgbOf = (page: Page, colour: string) =>
      page.evaluate((c) => {
        const probe = document.createElement('span');
        document.body.append(probe);
        probe.style.color = c;
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, colour);

    const expected = async (page: Page, theme: Theme) => ({
      ink: await rgbOf(page, tokenValue('ink', theme)),
      inkMuted: await rgbOf(page, tokenValue('ink-muted', theme)),
      border: await rgbOf(page, tokenValue('border', theme)),
      borderStrong: await rgbOf(page, tokenValue('border-strong', theme)),
      surface: await rgbOf(page, tokenValue('surface-100', theme)),
      series: [await rgbOf(page, chartColour(1, theme)), await rgbOf(page, chartColour(2, theme)), await rgbOf(page, chartColour(3, theme))],
    });

    /** Hovers the line chart, waits for its tooltip, and returns the colours it paints. */
    async function tooltipPaint(page: Page) {
      await page.mouse.move(0, 0);
      await expect.poll(() => figure(page, LINE).locator('.upmo-chart__tip').first().isVisible()).toBe(false);
      await hover(page, LINE, 0.5, 0.4);
      await tooltip(page, LINE);
      return figure(page, LINE)
        .locator('.upmo-chart__tooltip')
        .first()
        .evaluate((el) => {
          const style = getComputedStyle(el);
          const tip = el.querySelector('.upmo-chart__tip') as HTMLElement;
          const swatch = el.querySelector('.upmo-chart__tip-swatch') as HTMLElement;
          return {
            background: style.backgroundColor,
            border: style.borderTopColor,
            text: getComputedStyle(tip).color,
            swatch: getComputedStyle(swatch).backgroundColor,
          };
        });
    }

    it('repaints axis labels, axis and split lines, series, tooltip and legend from light to dark and back', async () => {
      await withCharts({ theme: 'light' }, async (page) => {
        const light = await expected(page, 'light');
        const dark = await expected(page, 'dark');
        expect(light.inkMuted).not.toBe(dark.inkMuted);

        const check = async (name: string, want: typeof light) => {
          await expect
            .poll(async () => (await paints(page)).xLabel, { message: `${name} x axis label` })
            .toBe(want.inkMuted);
          const now = await paints(page);
          expect(now.yLabel, `${name} y axis label`).toBe(want.inkMuted);
          expect(now.strokes, `${name} split lines`).toContain(want.border);
          expect(now.strokes, `${name} axis line`).toContain(want.borderStrong);
          for (const colour of want.series) expect(now.strokes, `${name} series`).toContain(colour);
          expect(now.legendDot, `${name} legend swatch`).toBe(want.series[0]);
          expect(now.legendValue, `${name} legend text`).toBe(want.ink);
          const tip = await tooltipPaint(page);
          expect(tip.background, `${name} tooltip background`).toBe(want.surface);
          expect(tip.border, `${name} tooltip border`).toBe(want.border);
          expect(tip.text, `${name} tooltip text`).toBe(want.ink);
          expect(tip.swatch, `${name} tooltip swatch`).toBeTruthy();
        };

        await check('light', light);
        await page.mouse.move(0, 0);

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await check('dark', dark);
        // None of the light axis, line or series colours is left behind.
        const stale = (await paints(page)).strokes.filter((c) => [light.inkMuted, light.border, light.borderStrong, ...light.series].includes(c));
        expect(stale).toEqual([]);
        await page.mouse.move(0, 0);

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        await check('light again', light);
      });
    });

    it('switches the other charts too: slices, bars and combo series follow the theme', async () => {
      await withCharts({ theme: 'light' }, async (page) => {
        const fills = (name: string) =>
          plot(page, name).evaluate((el) => {
            const probe = document.createElement('span');
            document.body.append(probe);
            const out = new Set<string>();
            for (const node of el.querySelectorAll('svg path, svg rect')) {
              for (const attr of ['fill', 'stroke']) {
                const v = node.getAttribute(attr);
                if (v && v !== 'none') {
                  probe.style.color = '';
                  probe.style.color = v;
                  out.add(getComputedStyle(probe).color);
                }
              }
            }
            probe.remove();
            return [...out];
          });
        const light1 = await rgbOf(page, chartColour(1, 'light'));
        const dark1 = await rgbOf(page, chartColour(1, 'dark'));
        for (const name of [DONUT, BARS, COMBO]) expect(await fills(name), name).toContain(light1);
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        for (const name of [DONUT, BARS, COMBO]) {
          await expect.poll(() => fills(name), { message: name }).toContain(dark1);
          expect(await fills(name), name).not.toContain(light1);
        }
      });
    });

    it('adds decals and symbols when the theme switches to high contrast, and drops them again', async () => {
      await withCharts({ theme: 'light' }, async (page) => {
        const patterns = (name: string) => plot(page, name).locator('svg pattern').count();
        const lineSymbols = () => plot(page, LINE).locator('svg path').count();
        const base = await lineSymbols();
        for (const name of [DONUT, BARS, COMBO]) expect(await patterns(name), name).toBe(0);

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'hc'));
        for (const name of [DONUT, BARS, COMBO]) {
          await expect.poll(() => patterns(name), { message: `${name} decals` }).toBeGreaterThan(0);
        }
        await expect.poll(lineSymbols, { message: 'line symbols' }).toBeGreaterThanOrEqual(base + 20);
        // The hc tokens are in effect too.
        const hc = await expected(page, 'hc');
        await expect.poll(async () => (await paints(page)).xLabel).toBe(hc.inkMuted);

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        for (const name of [DONUT, BARS, COMBO]) {
          await expect.poll(() => patterns(name), { message: `${name} decals gone` }).toBe(0);
        }
        await expect.poll(lineSymbols, { message: 'line symbols gone' }).toBe(base);
      });
    });

    it('turns decals on when only the high contrast media preference flips', async () => {
      await withCharts({ theme: 'light', context: { contrast: 'no-preference' } }, async (page) => {
        const patterns = () => plot(page, DONUT).locator('svg pattern').count();
        expect(await patterns()).toBe(0);
        await page.emulateMedia({ contrast: 'more' });
        await expect.poll(patterns).toBeGreaterThan(0);
        await page.emulateMedia({ contrast: 'no-preference' });
        await expect.poll(patterns).toBe(0);
      });
    });
  });

  describe('high contrast', () => {
    const patterns = (page: Page, name: string) => plot(page, name).locator('svg pattern').count();

    it('adds fill patterns to bars, slices and the combo bars with prefers-contrast: more', async () => {
      await withCharts({ context: { contrast: 'more' } }, async (page) => {
        for (const name of [DONUT, BARS, COMBO]) expect(await patterns(page, name), name).toBeGreaterThan(0);
      });
    });

    it('adds them in the hc theme too, and not in the normal themes', async () => {
      await withCharts({ theme: 'hc' }, async (page) => {
        for (const name of [DONUT, BARS, COMBO]) expect(await patterns(page, name), name).toBeGreaterThan(0);
      });
      await withCharts({ theme: 'light' }, async (page) => {
        for (const name of [DONUT, BARS, COMBO]) expect(await patterns(page, name), name).toBe(0);
      });
    });

    it('shows a symbol at every point of the lines, and none in the normal themes', async () => {
      // A symbol is a path with a closed outline; a line series with symbols off has one path per series.
      const countPaths = (page: Page) => plot(page, LINE).locator('svg path').count();
      let normalCount = 0;
      await withCharts({ theme: 'light' }, async (page) => {
        normalCount = await countPaths(page);
      });
      await withCharts({ theme: 'hc' }, async (page) => {
        // 3 series x 7 points, less the one gap, add at least 20 symbols.
        expect(await countPaths(page)).toBeGreaterThanOrEqual(normalCount + 20);
      });
    });

    it('adds the fill patterns in forced colours too, with no contrast preference set', async () => {
      await withCharts({ context: { forcedColors: 'active', contrast: 'no-preference' } }, async (page) => {
        for (const name of [DONUT, BARS, COMBO]) expect(await patterns(page, name), name).toBeGreaterThan(0);
      });
    });

    it('stays drawn and legible in forced colours', async () => {
      await withCharts({ context: { forcedColors: 'active' } }, async (page) => {
        for (const name of [LINE, DONUT, BARS, COMBO]) {
          expect(await plot(page, name).locator('svg').count(), name).toBe(1);
        }
        const swatch = await figure(page, LINE).locator('.upmo-chart__dot').first().evaluate((el) => getComputedStyle(el).forcedColorAdjust);
        expect(swatch).toBe('none');
      });
    });
  });

  describe('accessibility', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      it(`has no axe violations in ${theme}, including colour contrast`, async () => {
        await withCharts({ theme }, async (page) => {
          await page.addScriptTag({ content: axe.source });
          const violations = await page.evaluate(async () => {
            const result = await (window as unknown as { axe: typeof axe }).axe.run(document, {
              // The page-level rules describe the bare fixture page, not the charts.
              rules: {
                region: { enabled: false },
                'document-title': { enabled: false },
                'html-has-lang': { enabled: false },
                'landmark-one-main': { enabled: false },
                'page-has-heading-one': { enabled: false },
              },
            });
            return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
          });
          expect(violations).toEqual([]);
        });
      });
    }

    it('keeps the data in a hidden table with every point of every series', async () => {
      await withCharts({}, async (page) => {
        const table = page.getByRole('table', { name: LINE, exact: true });
        expect(await table.getByRole('row').count()).toBe(8);
        const cells = await table.getByRole('row').nth(3).getByRole('cell').allTextContents();
        expect(cells).toEqual(['1,500 tok', 'No data', '240 tok']);
      });
    });
  });
});

// UPM-213: at 360 px the dollar labels of a horizontal bar chart's value axis were drawn
// on top of each other ("US$0.00US$0.50US$1.00US$1.50"). Real text boxes are needed to see
// that, so this renders the charts that have axes in narrow viewports and compares the boxes
// of every label the SVG actually paints.
describe.skipIf(!enabled)('axis labels on narrow charts', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/charts-axes-entry.tsx')],
      bundle: true,
      write: false,
      outdir: 'out',
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      minify: true,
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
    });
    js = result.outputFiles.find((f) => f.path.endsWith('.js'))!.text;
    css = result.outputFiles.find((f) => f.path.endsWith('.css'))!.text;
    browser = await chromium.launch();
  }, 120_000);

  afterAll(async () => {
    await browser?.close();
  });

  const LINE_AXES = 'Cost per day';
  const BARS_VERTICAL = 'Cost by weekday';
  const BARS_HORIZONTAL = 'Cost per task';
  const COMBO_AXES = 'Spend and success rate';
  const DONUT_AXES = 'Runs by model';
  const VERTICAL_AXES = [LINE_AXES, BARS_VERTICAL, COMBO_AXES];
  const WITH_AXES = [LINE_AXES, BARS_VERTICAL, BARS_HORIZONTAL, COMBO_AXES];

  /** Draws the five charts of the axes fixture in a viewport `width` px wide, then runs `run`. */
  async function withAxes<T>(width: number, short: boolean, run: (page: Page) => Promise<T>) {
    const context = await browser.newContext({ viewport: { width, height: 2400 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body style="margin:0"><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.evaluate((isShort) => {
        (window as unknown as { __AXES_SHORT__: boolean }).__AXES_SHORT__ = isShort;
      }, short);
      await page.addScriptTag({ content: js });
      await page.locator('[data-chart-ready="true"]').nth(4).waitFor({ state: 'visible', timeout: 20_000 });
      return await run(page);
    } finally {
      await context.close();
    }
  }

  interface Label {
    text: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
  }

  /**
   * The ComboChart's two axis names. They are text in the SVG too, but they are titles, not tick
   * labels (ECharts' hideOverlap does not cover them), and at 320 and 360 px they crowd each
   * other. That is a separate defect from UPM-213, noted in its report, so they are left out here.
   */
  const AXIS_NAMES = new Set(['Spend', 'Success rate']);

  /** The text boxes a chart's SVG paints for its axes: tick labels, not axis names. Labels ECharts hides are not painted. */
  const labelsOf = (page: Page, name: string): Promise<Label[]> =>
    page.locator(`[aria-label="${name}"] .upmo-chart__plot svg`).first().evaluate((svg, names) =>
      [...svg.querySelectorAll('text')]
        .filter((el) => {
          const style = getComputedStyle(el);
          const text = (el.textContent ?? '').trim();
          return style.display !== 'none' && style.visibility !== 'hidden' && text !== '' && !names.includes(text);
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent ?? '', left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        })
        .filter((l) => l.right - l.left > 0 && l.bottom - l.top > 0),
      [...AXIS_NAMES],
    );

  /** Pairs of labels whose boxes share more than half a pixel in both directions. */
  function overlaps(labels: readonly Label[]): string[] {
    const found: string[] = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i];
        const b = labels[j];
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (x > 0.5 && y > 0.5) {
          const box = (l: Label) => `${l.left.toFixed(0)}-${l.right.toFixed(0)} x ${l.top.toFixed(0)}-${l.bottom.toFixed(0)}`;
          found.push(
            `"${a.text}" (${box(a)}) and "${b.text}" (${box(b)}) overlap by ${x.toFixed(1)} x ${y.toFixed(1)} px`,
          );
        }
      }
    }
    return found;
  }

  /** The value axis labels: the ones that read as a number, not the day names or the axis names. */
  const valueLabels = (labels: readonly Label[]) => labels.filter((l) => /^(US\$)?[\d.,]+%?$/.test(l.text));

  for (const width of [320, 360]) {
    it(`draws no overlapping axis labels at ${width} px`, async () => {
      await withAxes(width, false, async (page) => {
        for (const name of WITH_AXES) {
          const labels = await labelsOf(page, name);
          expect(overlaps(labels), `${name} at ${width} px`).toEqual([]);
          // Not vacuous: the axis still has labels to read (at least its first and last tick).
          expect(valueLabels(labels).length, `${name} keeps value labels at ${width} px`).toBeGreaterThanOrEqual(2);
        }
        // The donut has no axes, so there is nothing to overlap.
        expect(await labelsOf(page, DONUT_AXES), 'donut').toEqual([]);
      });
    });

    it(`draws no overlapping axis labels at ${width} px when the vertical-axis charts are only 80 px tall`, async () => {
      await withAxes(width, true, async (page) => {
        for (const name of VERTICAL_AXES) {
          const labels = await labelsOf(page, name);
          expect(overlaps(labels), `${name} at ${width} px, 80 px tall`).toEqual([]);
          expect(valueLabels(labels).length, `${name} keeps value labels`).toBeGreaterThanOrEqual(2);
        }
      });
    });
  }

  it('keeps every tick of the Cost per task axis on a wide screen', async () => {
    await withAxes(700, false, async (page) => {
      const labels = await labelsOf(page, BARS_HORIZONTAL);
      expect(overlaps(labels)).toEqual([]);
      expect(valueLabels(labels).map((l) => l.text)).toEqual(['US$0.00', 'US$0.50', 'US$1.00', 'US$1.50']);
    });
  });

  it('thins the ticks again when the viewport narrows after the first draw', async () => {
    await withAxes(700, false, async (page) => {
      const wide = valueLabels(await labelsOf(page, BARS_HORIZONTAL)).length;
      await page.setViewportSize({ width: 320, height: 2400 });
      await expect
        .poll(
          async () => {
            const labels = await labelsOf(page, BARS_HORIZONTAL);
            return overlaps(labels).length === 0 && valueLabels(labels).length < wide;
          },
          { timeout: 20_000 },
        )
        .toBe(true);
    });
  });
});

describe.skipIf(!enabled)('ECharts bundle', () => {
  it('lands in a lazy chunk: the entry has no ECharts code, and the chunk size is reported', async () => {
    const result = await build({
      stdin: {
        contents: `import { LineChart } from './src/index.ts'; globalThis.__keep = LineChart;`,
        resolveDir: resolve(__dirname, '..'),
        loader: 'ts',
      },
      bundle: true,
      write: false,
      outdir: 'out',
      format: 'esm',
      splitting: true,
      platform: 'browser',
      jsx: 'automatic',
      minify: true,
      treeShaking: true,
      define: { 'process.env.NODE_ENV': '"production"' },
      loader: { '.css': 'empty' },
      logLevel: 'silent',
    });
    const js = result.outputFiles.filter((f) => f.path.endsWith('.js'));
    const sizes = js.map((f) => ({ file: f.path.split('/').pop()!, text: f.text, gzip: gzipSync(f.text).length }));
    const entry = sizes.find((s) => s.text.includes('__keep'))!;
    const echarts = sizes.filter((s) => s !== entry && /zrender|ECharts|echarts/i.test(s.text)).sort((a, b) => b.gzip - a.gzip)[0];
    expect(echarts, 'a separate chunk holds ECharts').toBeTruthy();
    expect(/zrender|echarts\.|\.registerPainter|registerProcessor/i.test(entry.text), 'the entry holds no ECharts').toBe(false);
    console.info(
      `lazy ECharts chunk: ${(echarts.text.length / 1024).toFixed(1)} kB minified, ${(echarts.gzip / 1024).toFixed(1)} kB gzip; entry with the components: ${(entry.text.length / 1024).toFixed(1)} kB minified, ${(entry.gzip / 1024).toFixed(1)} kB gzip`,
    );
    expect(echarts.gzip).toBeLessThan(260 * 1024);
  }, 120_000);
});
