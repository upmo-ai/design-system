// @vitest-environment node
//
// ChatThread scroll pinning, measured in a real browser. jsdom has no layout and
// its ResizeObserver is a stub, so following a reply that grows, and the thread
// scrolling inside its parent instead of the page, can only be checked in
// Chromium.
//
// Opt-in: it runs only when UPMO_REQUIRE_BROWSER=1 is set (see
// app-frame-drawer.browser.test.ts for how to run it in Playwright's image).
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.UPMO_REQUIRE_BROWSER === '1';
if (enabled && !existsSync(chromium.executablePath())) {
  throw new Error(`Chromium not found at ${chromium.executablePath()}; run this in the Playwright image.`);
}

describe.skipIf(!enabled)('ChatThread in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/chat-thread-entry.tsx')],
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

  async function withPage<T>(reducedMotion: 'reduce' | 'no-preference', run: (page: Page) => Promise<T>): Promise<T> {
    const context = await browser.newContext({ viewport: { width: 640, height: 700 }, reducedMotion });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: js });
      await page.getByRole('log', { name: 'Messages' }).waitFor();
      return await run(page);
    } finally {
      await context.close();
    }
  }

  const metrics = (page: Page) =>
    page.getByRole('log').evaluate((el) => ({
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      distance: el.scrollHeight - el.scrollTop - el.clientHeight,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight,
    }));

  const scrollLogTo = (page: Page, top: number) =>
    page.getByRole('log').evaluate((el, y) => {
      el.scrollTop = y;
    }, top);

  it('fills its parent, scrolls inside it and starts at the newest message', async () => {
    await withPage('reduce', async (page) => {
      const m = await metrics(page);
      expect(m.clientHeight).toBe(400);
      expect(m.scrollHeight).toBeGreaterThan(m.clientHeight);
      expect(m.distance).toBeLessThanOrEqual(1);
      expect(m.pageScrolls).toBe(false);
    });
  });

  it('follows a new message and a reply that grows while the reader is at the newest', async () => {
    await withPage('reduce', async (page) => {
      await page.getByRole('button', { name: 'Add message' }).click();
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      await page.getByRole('button', { name: 'Grow last' }).click();
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      await page.getByRole('button', { name: 'Grow last' }).click();
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
    });
  });

  it('stays put when the reader has scrolled up, then jumps back to the newest', async () => {
    await withPage('reduce', async (page) => {
      await scrollLogTo(page, 0);
      const jump = page.getByRole('button', { name: 'Jump to newest' });
      await jump.waitFor();
      await page.getByRole('button', { name: 'Add message' }).click();
      await page.getByRole('button', { name: 'Grow last' }).click();
      await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
      expect((await metrics(page)).scrollTop).toBe(0);
      await jump.click();
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      expect(await jump.count()).toBe(0);
      expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('log');
    });
  });

  // Clicks from the page, so focus stays on the log and the reader's position is not touched.
  const press = (page: Page, name: string) =>
    page.evaluate((label) => {
      [...document.querySelectorAll('button')].find((b) => b.textContent === label)?.click();
    }, name);
  const settled = (page: Page) =>
    page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));

  // Waits out a scroll animation: the position is the same on three frames running.
  const restingTop = async (page: Page) => {
    let last = -1;
    let same = 0;
    for (let frame = 0; frame < 120 && same < 3; frame += 1) {
      await settled(page);
      const top = (await metrics(page)).scrollTop;
      same = top === last ? same + 1 : 0;
      last = top;
    }
    return last;
  };

  it('lets go of the newest message on small ArrowUp steps while a reply grows', async () => {
    await withPage('reduce', async (page) => {
      await page.getByRole('log').focus();
      await press(page, 'Grow last');
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      let previous = (await metrics(page)).scrollTop;
      for (let step = 0; step < 4; step += 1) {
        await page.keyboard.press('ArrowUp');
        const top = await restingTop(page);
        expect(top).toBeLessThan(previous);
        await press(page, 'Grow last');
        await settled(page);
        // The reply grew by hundreds of pixels and the reader's place did not move.
        expect((await metrics(page)).scrollTop).toBe(top);
        previous = top;
      }
    });
  });

  it('lets go on a small wheel step up, and follows again once the reader returns to the bottom', async () => {
    await withPage('reduce', async (page) => {
      await page.getByRole('log').hover();
      await page.mouse.wheel(0, -30);
      await expect.poll(async () => (await metrics(page)).distance).toBeGreaterThan(5);
      const top = await restingTop(page);
      await press(page, 'Grow last');
      await settled(page);
      expect((await metrics(page)).scrollTop).toBe(top);

      await page.getByRole('log').focus();
      await page.keyboard.press('End');
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      await press(page, 'Grow last');
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
    });
  });

  it('glides to the newest message without showing the button again on the way', async () => {
    await withPage('no-preference', async (page) => {
      await scrollLogTo(page, 0);
      await page.getByRole('button', { name: 'Jump to newest' }).click();
      await expect.poll(async () => (await metrics(page)).distance, { timeout: 5000 }).toBeLessThanOrEqual(1);
      expect(await page.getByRole('button', { name: 'Jump to newest' }).count()).toBe(0);
    });
  });

  it('returns to the newest message when scrollKey changes, even from the top', async () => {
    await withPage('reduce', async (page) => {
      await scrollLogTo(page, 0);
      await page.getByRole('button', { name: 'Jump to newest' }).waitFor();
      await page.getByRole('button', { name: 'Send' }).click();
      await expect.poll(async () => (await metrics(page)).distance).toBeLessThanOrEqual(1);
      expect(await page.getByRole('button', { name: 'Jump to newest' }).count()).toBe(0);
    });
  });
});
