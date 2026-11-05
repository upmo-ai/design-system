// @vitest-environment node
//
// AppFrame `fill`, measured in a real browser. jsdom has no layout, so whether
// main is viewport-tall, whether the last child grows into the space under an
// alert, and whether main drops its padding can only be seen in Chromium.
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

type Scene = 'chat' | 'overflow' | 'plain';
type Motion = 'reduce' | 'no-preference';

interface Measure {
  viewportHeight: number;
  viewportWidth: number;
  headerBottom: number;
  main: { top: number; bottom: number; left: number; right: number; height: number; scrollHeight: number; clientHeight: number };
  padding: { top: string; right: string; bottom: string; left: string };
  alert: { top: number; bottom: number; height: number };
  last: { top: number; bottom: number };
  thread: { scrollHeight: number; clientHeight: number } | null;
  documentScrollHeight: number;
  overflowY: string;
}

describe.skipIf(!enabled)('AppFrame fill in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/app-frame-fill-entry.tsx')],
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

  async function mount(page: Page, scene: Scene, extraCss = '', motion: Motion = 'reduce') {
    await page.setContent('<!doctype html><html><head></head><body style="margin:0"><div id="root"></div></body></html>');
    await page.addStyleTag({ content: css + extraCss });
    await page.evaluate(
      ([value, motionValue]) => {
        const w = window as unknown as { upmoFillScene: string; upmoFillMotion: string };
        w.upmoFillScene = value;
        w.upmoFillMotion = motionValue;
      },
      [scene, motion],
    );
    await page.addScriptTag({ content: js });
    await page.getByRole('main').waitFor();
    await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  }

  /** Mantine mutes AppShell transitions while it mounts and while the window resizes; wait for that to end. */
  function settled(page: Page) {
    return page.waitForFunction(() => !document.querySelector('.mantine-AppShell-root')!.hasAttribute('data-resizing'));
  }

  function measure(page: Page): Promise<Measure> {
    return page.evaluate(() => {
      const box = (el: Element) => el.getBoundingClientRect();
      const main = document.querySelector('main')!;
      const mainBox = box(main);
      const style = getComputedStyle(main);
      const alert = main.firstElementChild!;
      const last = main.lastElementChild!;
      const thread = main.querySelector('.chat-thread');
      return {
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        headerBottom: box(document.querySelector('header')!).bottom,
        main: {
          top: mainBox.top,
          bottom: mainBox.bottom,
          left: mainBox.left,
          right: mainBox.right,
          height: mainBox.height,
          scrollHeight: main.scrollHeight,
          clientHeight: main.clientHeight,
        },
        padding: {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        },
        alert: { top: box(alert).top, bottom: box(alert).bottom, height: box(alert).height },
        last: { top: box(last).top, bottom: box(last).bottom },
        thread: thread ? { scrollHeight: thread.scrollHeight, clientHeight: thread.clientHeight } : null,
        documentScrollHeight: document.documentElement.scrollHeight,
        overflowY: style.overflowY,
      };
    });
  }

  describe.each([
    { name: 'phone', width: 360, height: 740 },
    { name: 'tablet', width: 800, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ])('at $name width ($width px)', ({ width, height }) => {
    async function withPage<T>(scene: Scene, run: (page: Page) => Promise<T>, extraCss = '', motion: Motion = 'reduce') {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: motion });
      try {
        const page = await context.newPage();
        await mount(page, scene, extraCss, motion);
        return await run(page);
      } finally {
        await context.close();
      }
    }

    it('makes main the viewport height, and the last child fills what the alert leaves', async () => {
      const m = await withPage('chat', measure);
      console.log('[measure]', JSON.stringify(m));
      expect(m.main.top).toBe(0);
      expect(m.main.height).toBe(m.viewportHeight);
      // The alert keeps its own height, below the top bar.
      expect(m.alert.top).toBeGreaterThanOrEqual(m.headerBottom);
      expect(m.alert.height).toBeLessThan(m.viewportHeight / 4);
      // The last child starts under the alert and ends at the bottom edge.
      expect(m.last.top).toBeGreaterThanOrEqual(m.alert.bottom);
      expect(m.last.bottom).toBe(m.viewportHeight);
      // Nothing scrolls: main fits, and the thread scrolls inside the page.
      expect(m.main.scrollHeight).toBeLessThanOrEqual(m.main.clientHeight);
      expect(m.documentScrollHeight).toBeLessThanOrEqual(m.viewportHeight);
      expect(m.thread!.scrollHeight).toBeGreaterThan(m.thread!.clientHeight);
    });

    it('drops the main padding but keeps the offsets for the top bar and the rail', async () => {
      const m = await withPage('chat', measure);
      expect(m.padding.top).toBe(`${m.headerBottom}px`);
      expect(m.padding.bottom).toBe('0px');
      expect(m.padding.right).toBe('0px');
      // The inline start is the rail or sidebar width, with no page padding on top.
      const railWidth = width >= 992 ? 248 : width >= 768 ? 56 : 0;
      expect(Number.parseFloat(m.padding.left)).toBeGreaterThanOrEqual(railWidth);
      expect(Number.parseFloat(m.padding.left)).toBeLessThanOrEqual(railWidth + 1);
    });

    it('scrolls inside main when the last child is taller than the viewport', async () => {
      const m = await withPage('overflow', measure);
      expect(m.main.height).toBe(m.viewportHeight);
      expect(m.main.scrollHeight).toBeGreaterThan(m.main.clientHeight);
      expect(m.documentScrollHeight).toBeLessThanOrEqual(m.viewportHeight);
    });

    it('does not slide the main padding when fill switches on', async () => {
      const { before, after } = await withPage(
        'plain',
        async (page) => {
          await settled(page);
          return page.evaluate(() => {
            const main = document.querySelector('main')!;
            const before = getComputedStyle(main).paddingBottom;
            // Read straight after the change: a running padding transition would still report the old value.
            main.setAttribute('data-fill', 'true');
            const style = getComputedStyle(main);
            return { before, after: { paddingBottom: style.paddingBottom, duration: style.transitionDuration } };
          });
        },
        '',
        'no-preference',
      );
      expect(Number.parseFloat(before)).toBeGreaterThan(0);
      expect(after.paddingBottom).toBe('0px');
      expect(after.duration).toBe('0s');
    });

    it('keeps the padding transition without fill, so the rail still slides the content', async () => {
      const duration = await withPage(
        'plain',
        async (page) => {
          await settled(page);
          return page.evaluate(() => getComputedStyle(document.querySelector('main')!).transitionDuration);
        },
        '',
        'no-preference',
      );
      expect(duration).not.toBe('0s');
    });

    it('keeps focused controls clear of the top bar when main scrolls', async () => {
      const m = await withPage('overflow', (page) =>
        page.evaluate(() => {
          const main = document.querySelector('main')!;
          main.scrollTop = 2000;
          document.querySelector('.tall-target')!.scrollIntoView({ block: 'start' });
          return {
            targetTop: document.querySelector('.tall-target')!.getBoundingClientRect().top,
            headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
            scrollPaddingTop: getComputedStyle(main).scrollPaddingTop,
          };
        }),
      );
      expect(m.scrollPaddingTop).toBe(`${m.headerBottom}px`);
      expect(m.targetTop).toBeGreaterThanOrEqual(m.headerBottom);
    });

    it('lets a page style on mainClassName win over the fill rules', async () => {
      const m = await withPage('chat', measure, '.app-main { overflow-y: hidden; }');
      expect(m.overflowY).toBe('hidden');
    });

    it('leaves main as a padded block without fill', async () => {
      const m = await withPage('plain', measure);
      expect(Number.parseFloat(m.padding.bottom)).toBeGreaterThan(0);
      expect(Number.parseFloat(m.padding.right)).toBeGreaterThan(0);
    });
  });
});
