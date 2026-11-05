// @vitest-environment node
//
// NotificationBell with a real keyboard, in a real browser. A browser presses a
// focused button on the Enter keydown, and repeats that keydown while the key is
// held, which jsdom does not do. So whether a held Enter on the bell can reach
// an Approve button inside the popover can only be checked in Chromium.
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

describe.skipIf(!enabled)('NotificationBell in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/notification-bell-entry.tsx')],
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

  async function withPage<T>(run: (page: Page) => Promise<T>): Promise<T> {
    const context = await browser.newContext({ viewport: { width: 640, height: 700 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: js });
      await page.getByRole('button', { name: 'Notifications, 1 unread' }).waitFor();
      return await run(page);
    } finally {
      await context.close();
    }
  }

  const approvals = (page: Page) => page.getByLabel('Approvals').textContent();
  const focusedName = (page: Page) =>
    page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName.toLowerCase()}:${el.textContent?.trim()}` : '';
    });

  it('opens with focus on the dialog name and approves nothing when Enter is held', async () => {
    await withPage(async (page) => {
      await page.getByRole('button', { name: 'Notifications, 1 unread' }).focus();
      await page.keyboard.down('Enter');
      const dialog = page.getByRole('dialog', { name: 'Notifications' });
      await dialog.waitFor();
      await expect.poll(() => focusedName(page)).toBe('h2:Notifications');
      // The key is still down: the browser now repeats Enter on the focused element.
      await page.keyboard.down('Enter');
      await page.keyboard.down('Enter');
      await page.keyboard.up('Enter');
      expect(await approvals(page)).toBe('0');
      expect(await dialog.count()).toBe(1);
    });
  });

  it('Tab from the name reaches Approve, and Enter there approves', async () => {
    await withPage(async (page) => {
      await page.getByRole('button', { name: 'Notifications, 1 unread' }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('dialog', { name: 'Notifications' }).waitFor();
      await expect.poll(() => focusedName(page)).toBe('h2:Notifications');
      await page.keyboard.press('Tab');
      expect(await focusedName(page)).toBe('button:Approve');
      await page.keyboard.press('Enter');
      expect(await approvals(page)).toBe('1');
    });
  });
});
