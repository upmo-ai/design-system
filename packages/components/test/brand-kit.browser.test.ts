// @vitest-environment node
//
// The brand kit as shown in the docs site and in Storybook, checked in a real
// browser, because forced colours, the cascade and the SVG image sandbox do not
// exist in jsdom. It serves the built output of both apps, so run `pnpm build`
// first. Opt-in like the other browser suites: `pnpm --filter
// @upmo-ai/components test:browser` sets UPMO_REQUIRE_BROWSER=1 and runs it in
// Playwright's image.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.UPMO_REQUIRE_BROWSER === '1';
if (enabled && !existsSync(chromium.executablePath())) {
  throw new Error(`Chromium not found at ${chromium.executablePath()}; run this in the Playwright image.`);
}

const repo = resolve(__dirname, '../../..');
const tokens = JSON.parse(readFileSync(join(repo, 'packages/tokens/tokens.json'), 'utf8'));

type Entry = { name: string; value: string | Record<string, string> };

function find(group: { tokens: Entry[] }, name: string): Entry['value'] {
  const entry = group.tokens.find((t) => t.name === name);
  if (!entry) throw new Error(`tokens.json has no "${name}"`);
  return entry.value;
}

const colour = (name: string, theme: 'light' | 'dark') => (find(tokens.color, name) as Record<string, string>)[theme];
const space = (name: string) => find(tokens.spacing, name) as string;

// "#1b1e24" -> "rgb(27, 30, 36)", the form getComputedStyle reports.
function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function serve(root: string): Promise<{ server: Server; origin: string }> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((done) =>
    server.listen(0, '127.0.0.1', () => done({ server, origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}` })),
  );
}

const docsRoot = join(repo, 'apps/docs/dist');
const storybookRoot = join(repo, 'apps/storybook/storybook-static');

describe.skipIf(!enabled)('brand kit in a real browser', () => {
  let browser: Browser;
  let docs: { server: Server; origin: string };
  let storybook: { server: Server; origin: string };

  beforeAll(async () => {
    for (const root of [docsRoot, storybookRoot]) {
      if (!existsSync(root)) throw new Error(`${root} is missing; run \`pnpm build\` first.`);
    }
    docs = await serve(docsRoot);
    storybook = await serve(storybookRoot);
    browser = await chromium.launch();
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
    docs?.server.close();
    storybook?.server.close();
  });

  // Anything off this machine (web fonts) is refused, so the page never waits on the network.
  async function open(url: string, options: BrowserContextOptions, ready: string): Promise<{ page: Page; close: () => Promise<void> }> {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ...options });
    await context.route((u) => u.hostname !== '127.0.0.1', (route) => route.abort());
    const page = await context.newPage();
    await page.goto(url);
    await page.locator(ready).first().waitFor();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    return { page, close: () => context.close() };
  }

  const background = (page: Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor);

  describe('docs brand page', () => {
    const url = () => `${docs.origin}/brand/`;

    it('keeps each tile on its own ground in forced colours, so a white mark is not drawn on white', async () => {
      const { page, close } = await open(url(), { forcedColors: 'active' }, '.brand-tile');
      try {
        expect(await background(page, '.brand-tile[data-theme="dark"]')).toBe(rgb(colour('surface-000', 'dark')));
        expect(await background(page, '.brand-tile[data-theme="light"]')).toBe(rgb(colour('surface-000', 'light')));
      } finally {
        await close();
      }
    });

    it('spaces the card name from the tile by the space-3 token', async () => {
      const { page, close } = await open(url(), {}, '.brand-card__name');
      try {
        const name = page.locator('.brand-card__name').first();
        const expected = space('space-3');
        expect(await name.evaluate((el) => getComputedStyle(el).getPropertyValue('--space-3').trim())).toBe(expected);
        expect(await name.evaluate((el) => getComputedStyle(el).marginTop)).toBe(expected);
        expect(await page.locator('.brand-card__note').first().evaluate((el) => getComputedStyle(el).marginTop)).toBe('0px');
      } finally {
        await close();
      }
    });

    it('names the table of web files', async () => {
      const { page, close } = await open(url(), {}, 'table');
      try {
        expect(await page.getByRole('table', { name: 'Files for the web' }).count()).toBe(1);
      } finally {
        await close();
      }
    });

    it('offers the currentColor mono wordmark and caret for download', async () => {
      const { page, close } = await open(url(), {}, '.brand-card');
      try {
        for (const mark of ['wordmark', 'caret']) {
          const link = page.getByRole('link', { name: `Download SVG of the mono ${mark}` });
          expect(await link.count(), mark).toBe(1);
          const href = (await link.getAttribute('href')) ?? '';
          expect(href).toBe(`/brand/files/svg/${mark}-mono.svg`);
          const response = await page.request.get(docs.origin + href);
          expect(response.status(), href).toBe(200);
          expect(await response.text(), href).toContain('currentColor');
        }
      } finally {
        await close();
      }
    });
  });

  describe('Storybook asset kit', () => {
    const story = (id: string) => `${storybook.origin}/iframe.html?id=${id}&viewMode=story`;

    it('keeps each tile on its own ground in forced colours', async () => {
      const { page, close } = await open(story('brand-asset-kit--wordmark'), { forcedColors: 'active' }, 'figure');
      try {
        expect(await background(page, 'figure > [data-theme="dark"]')).toBe(rgb(colour('surface-000', 'dark')));
        expect(await background(page, 'figure > [data-theme="light"]')).toBe(rgb(colour('surface-000', 'light')));
      } finally {
        await close();
      }
    });

    // The favicon switches on the system colour scheme. The two tiles must
    // preview its two colours whatever the system is set to.
    for (const colorScheme of ['light', 'dark'] as const) {
      it(`previews the favicon in the colour of each tile with a ${colorScheme} system`, async () => {
        const { page, close } = await open(story('brand-asset-kit--app-icons'), { colorScheme }, 'figure');
        try {
          const stroke = (caption: string) =>
            page
              .locator('figure', { has: page.getByText(caption, { exact: true }) })
              .locator('svg path')
              .evaluate((el) => getComputedStyle(el).stroke);
          expect(await stroke('favicon.svg')).toBe(rgb(colour('emerald', 'light')));
          expect(await stroke('favicon.svg on dark')).toBe(rgb(colour('emerald', 'dark')));
        } finally {
          await close();
        }
      });
    }
  });
});
