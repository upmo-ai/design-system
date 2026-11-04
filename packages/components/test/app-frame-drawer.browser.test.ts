// @vitest-environment node
//
// AppFrame drawer layout, measured in a real browser. jsdom has no layout, so
// the height of the drawer (the bug this guards: `flex: 0 0 var(--sidebar)` on
// the full-viewport Mantine wrapper left the drawer ~248px tall with the nav cut
// off) can only be checked in Chromium.
//
// Opt-in: it runs only when UPMO_REQUIRE_BROWSER=1 is set, so a plain
// `pnpm test` never launches a browser. The `test:browser` script sets the
// variable (in any shell) and fails when Chromium is missing. Run it with
// Playwright's image, which ships Chromium:
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

// What a consumer carried while the bug existed. It must stay harmless.
const consumerWorkaround = `.mantine-Drawer-inner.upmo-app-frame__drawer { flex-direction: row; background: none; }`;

const viewports = [
  { name: 'phone', width: 360, height: 740 },
  { name: 'tablet', width: 800, height: 1024 },
] as const;

interface Measure {
  viewportHeight: number;
  inner: { top: number; height: number };
  content: { top: number; bottom: number; left: number; height: number; width: number };
  nav: { clientHeight: number; scrollHeight: number };
  lastItem: { top: number; bottom: number };
  footer: { top: number; bottom: number };
  innerHasDrawerClass: boolean;
  contentHasDrawerClass: boolean;
}

describe.skipIf(!enabled)('AppFrame drawer in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/app-frame-entry.tsx')],
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

  async function openDrawer(page: Page, extraCss = '') {
    await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
    await page.addStyleTag({ content: css + extraCss });
    await page.addScriptTag({ content: js });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    await drawer.waitFor();
    // Wait out the slide-in so the box is at rest.
    await page.waitForFunction(() => {
      const el = document.querySelector('.mantine-Drawer-content');
      return !!el && el.getBoundingClientRect().left >= 0 && getComputedStyle(el).opacity === '1';
    });
    await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  }

  function measure(page: Page): Promise<Measure> {
    return page.evaluate(() => {
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, height: r.height, width: r.width };
      };
      const inner = document.querySelector('.mantine-Drawer-inner')!;
      const content = document.querySelector('.mantine-Drawer-content')!;
      const nav = content.querySelector('.upmo-app-frame__rail-nav')!;
      const items = [...content.querySelectorAll('a')];
      return {
        viewportHeight: window.innerHeight,
        inner: box(inner),
        content: box(content),
        nav: { clientHeight: nav.clientHeight, scrollHeight: nav.scrollHeight },
        lastItem: box(items[items.length - 1]!),
        footer: box(content.querySelector('.upmo-app-frame__rail-footer')!),
        innerHasDrawerClass: inner.classList.contains('upmo-app-frame__drawer'),
        contentHasDrawerClass: content.classList.contains('upmo-app-frame__drawer'),
      };
    });
  }

  function expectFullHeightDrawer(m: Measure) {
    // The drawer is as tall as the viewport, not as tall as its content.
    expect(m.content.top).toBe(0);
    expect(m.content.height).toBe(m.viewportHeight);
    expect(m.inner.height).toBe(m.viewportHeight);
    // The whole nav is visible: nothing scrolls, the last item sits inside the
    // drawer, and the footer is pinned to the bottom edge.
    expect(m.nav.scrollHeight).toBeLessThanOrEqual(m.nav.clientHeight);
    expect(m.lastItem.top).toBeGreaterThanOrEqual(0);
    expect(m.lastItem.bottom).toBeLessThanOrEqual(m.footer.top);
    expect(m.footer.bottom).toBe(m.viewportHeight);
  }

  describe.each(viewports)('at $name width ($width px)', ({ width, height }) => {
    async function withPage<T>(extraCss: string, run: (page: Page) => Promise<T>): Promise<T> {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        await openDrawer(page, extraCss);
        return await run(page);
      } finally {
        await context.close();
      }
    }

    it('fills the viewport height with the whole nav visible', async () => {
      const m = await withPage('', measure);
      expectFullHeightDrawer(m);
      expect(m.contentHasDrawerClass).toBe(true);
      expect(m.innerHasDrawerClass).toBe(false);
    });

    it('is unchanged when a consumer still carries the old workaround rule', async () => {
      const m = await withPage(consumerWorkaround, measure);
      expectFullHeightDrawer(m);
    });
  });
});
