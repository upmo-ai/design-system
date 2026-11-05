// @vitest-environment node
//
// DataTable in a real browser. jsdom has no layout, so whether a table wider
// than its container can be scrolled with the keyboard, and where the caption
// sits, can only be seen in Chromium.
//
// Opt-in, like the AppFrame drawer test: it runs only when UPMO_REQUIRE_BROWSER=1
// is set (the `test:browser` script sets it). Run it with Playwright's image:
//   docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.61.1-noble \
//     sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @upmo-ai/components test:browser"
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.UPMO_REQUIRE_BROWSER === '1';
if (enabled && !existsSync(chromium.executablePath())) {
  throw new Error(`Chromium not found at ${chromium.executablePath()}; run this in the Playwright image.`);
}

describe.skipIf(!enabled)('DataTable in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/data-table-entry.tsx')],
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
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
  });

  async function withPage<T>(width: number, run: (page: Page) => Promise<T>) {
    const context = await browser.newContext({ viewport: { width, height: 740 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body style="margin:0"><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: js });
      await page.getByRole('table', { name: 'Recent runs' }).waitFor();
      return await run(page);
    } finally {
      await context.close();
    }
  }

  it('puts the caption above the header row', async () => {
    const m = await withPage(360, (page) =>
      page.evaluate(() => ({
        captionBottom: document.querySelector('caption')!.getBoundingClientRect().bottom,
        headerTop: document.querySelector('thead')!.getBoundingClientRect().top,
      })),
    );
    expect(m.captionBottom).toBeLessThanOrEqual(m.headerTop);
  });

  it('scrolls a wide table sideways with the keyboard, from a named region', async () => {
    const m = await withPage(360, async (page) => {
      const before = await page.evaluate(() => {
        const region = document.querySelector('[role="region"]')!;
        return { scrollWidth: region.scrollWidth, clientWidth: region.clientWidth, scrollLeft: region.scrollLeft };
      });
      // The region is the first tab stop on the page.
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement!;
        return {
          role: el.getAttribute('role'),
          name: document.getElementById(el.getAttribute('aria-labelledby') ?? '')?.textContent,
          outlineStyle: getComputedStyle(el).outlineStyle,
        };
      });
      await page.keyboard.press('ArrowRight');
      // Keyboard scrolling can animate; wait for it to move, not for a fixed time.
      await page.waitForFunction(() => document.querySelector('[role="region"]')!.scrollLeft > 0, undefined, {
        timeout: 5000,
      });
      const scrollLeft = await page.evaluate(() => document.querySelector('[role="region"]')!.scrollLeft);
      const documentOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      return { before, focused, scrollLeft, documentOverflow };
    });
    // The table is wider than the region, so there is something to reach.
    expect(m.before.scrollWidth).toBeGreaterThan(m.before.clientWidth);
    expect(m.before.scrollLeft).toBe(0);
    expect(m.focused).toEqual({ role: 'region', name: 'Recent runs', outlineStyle: 'solid' });
    expect(m.scrollLeft).toBeGreaterThan(0);
    // Only the region scrolls, not the page.
    expect(m.documentOverflow).toBeLessThanOrEqual(0);
  });
});
