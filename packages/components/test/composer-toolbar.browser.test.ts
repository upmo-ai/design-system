// @vitest-environment node
//
// Composer toolbar layout, measured in a real browser. jsdom has no layout, so
// the narrow-width regression this guards can only be seen in Chromium: at
// 360px the pills clipped their labels ("Auto · Default · C", "Au") on a single
// non-wrapping row.
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

interface Measure {
  form: { left: number; right: number; bottom: number; scrollWidth: number; clientWidth: number };
  pills: { text: string; clientWidth: number; scrollWidth: number; top: number; bottom: number }[];
  send: { top: number; bottom: number; left: number; right: number };
  /** Top of the first control in the tools row. */
  firstToolTop: number;
  toolsBottom: number;
  /** Left, width and top of each control in the tools row, in order. */
  controls: { left: number; width: number; top: number }[];
}

describe.skipIf(!enabled)('Composer toolbar in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/composer-entry.tsx')],
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

  async function mount(page: Page, toolbar?: 'auto' | 'full' | 'compact') {
    await page.setContent('<!doctype html><html><head></head><body style="margin:0"><div id="root"></div></body></html>');
    await page.addStyleTag({ content: css });
    if (toolbar) await page.evaluate((value) => ((window as unknown as { upmoComposerToolbar: string }).upmoComposerToolbar = value), toolbar);
    await page.addScriptTag({ content: js });
    await page.getByRole('form', { name: 'Chat composer' }).waitFor();
  }

  function measure(page: Page): Promise<Measure> {
    return page.evaluate(() => {
      const form = document.querySelector('.upmo-composer__form')!;
      const formBox = form.getBoundingClientRect();
      const tools = document.querySelector('.upmo-composer__tools')!;
      const first = tools.firstElementChild!.getBoundingClientRect();
      const send = document.querySelector('.upmo-composer__send')!.getBoundingClientRect();
      return {
        form: {
          left: formBox.left,
          right: formBox.right,
          bottom: formBox.bottom,
          scrollWidth: form.scrollWidth,
          clientWidth: form.clientWidth,
        },
        pills: [...document.querySelectorAll('.upmo-composer__pill-text')].map((el) => {
          const box = el.closest('.upmo-composer__pill')!.getBoundingClientRect();
          return {
            text: el.textContent ?? '',
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            top: box.top,
            bottom: box.bottom,
          };
        }),
        send: { top: send.top, bottom: send.bottom, left: send.left, right: send.right },
        firstToolTop: first.top,
        toolsBottom: tools.getBoundingClientRect().bottom,
        controls: [...tools.children].map((el) => {
          const box = el.getBoundingClientRect();
          return { left: box.left, width: box.width, top: box.top };
        }),
      };
    });
  }

  describe.each([
    { name: 'phone', width: 360 },
    { name: 'narrow phone', width: 320 },
  ])('at $name width ($width px)', ({ width }) => {
    async function withPage<T>(toolbar: 'auto' | 'full' | 'compact' | undefined, run: (page: Page) => Promise<T>) {
      const context = await browser.newContext({ viewport: { width, height: 740 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        await mount(page, toolbar);
        return await run(page);
      } finally {
        await context.close();
      }
    }

    it('goes compact on its own, with no pill label clipped and Send on the first line', async () => {
      const m = await withPage(undefined, async (page) => {
        // Compact once the form has been measured: the pill shows the model.
        await page.waitForFunction(() => document.querySelector('.upmo-composer__pill-text')?.textContent === 'Claude Sonnet');
        return measure(page);
      });
      console.log('[measure]', JSON.stringify(m));
      for (const pill of m.pills) expect(pill.scrollWidth, pill.text).toBeLessThanOrEqual(pill.clientWidth);
      expect(m.pills.map((p) => p.text)).toEqual(['Claude Sonnet', 'Auto']);
      // Send shares the first line with the first control and stays inside the form.
      expect(m.send.top).toBeLessThanOrEqual(m.firstToolTop + 4);
      expect(m.send.right).toBeLessThanOrEqual(m.form.right);
      expect(m.form.scrollWidth).toBeLessThanOrEqual(m.form.clientWidth);
      // At 360px everything fits one line; the 320px phone may wrap the tools pill.
      if (width >= 360) expect(m.toolsBottom - m.firstToolTop).toBeLessThan(48);
    });

    it('wraps a full toolbar inside the form instead of overflowing it', async () => {
      const m = await withPage('full', measure);
      console.log('[measure]', JSON.stringify(m));
      expect(m.form.scrollWidth).toBeLessThanOrEqual(m.form.clientWidth);
      expect(m.send.right).toBeLessThanOrEqual(m.form.right);
      expect(m.toolsBottom).toBeLessThanOrEqual(m.form.bottom);
      expect(m.send.top).toBeLessThanOrEqual(m.firstToolTop + 4);
    });
  });

  it('keeps the full summary on a wide composer', async () => {
    const context = await browser.newContext({ viewport: { width: 900, height: 740 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await mount(page);
      const pillText = () => page.evaluate(() => document.querySelector('.upmo-composer__pill-text')?.textContent);
      // Let the first measurement land: two frames after mount, the width observer has reported.
      await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
      expect(await pillText()).toBe('Auto · Default · Claude Sonnet');

      // Prove the observer is live: a narrow window turns the pill compact, a wide one restores it.
      await page.setViewportSize({ width: 360, height: 740 });
      await page.waitForFunction(() => document.querySelector('.upmo-composer__pill-text')?.textContent === 'Claude Sonnet');
      await page.setViewportSize({ width: 900, height: 740 });
      await page.waitForFunction(
        () => document.querySelector('.upmo-composer__pill-text')?.textContent === 'Auto · Default · Claude Sonnet',
      );

      const m = await measure(page);
      expect(m.pills[0]?.text).toBe('Auto · Default · Claude Sonnet');
      for (const pill of m.pills) expect(pill.scrollWidth, pill.text).toBeLessThanOrEqual(pill.clientWidth);
      // All controls share one line.
      expect(m.toolsBottom - m.firstToolTop).toBeLessThan(48);
    } finally {
      await context.close();
    }
  });
});
