// @vitest-environment node
//
// Connect surface layout, measured in a real browser. jsdom has no layout, so
// the four regressions this guards can only be seen in Chromium:
//   1. the "Connected" status badge shrank to "CONNE..." in a 320px card;
//   2. the card actions stacked on two rows with an indent instead of sitting
//      on one start-aligned row;
//   3. a selected BrandTileGrid tile lost its selected look on hover;
//   4. the TestConnectionPanel button stretched to the full panel width.
//
// Opt-in, like the AppFrame drawer test: it runs only when UPMO_REQUIRE_BROWSER=1
// is set (the `test:browser` script sets it). Run it with Playwright's image:
//   docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.61.1-noble \
//     sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @upmo-ai/components test:browser"
//
// Every measurement is also printed as a `[measure]` line, so a run reports the
// numbers and not only pass or fail.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.UPMO_REQUIRE_BROWSER === '1';
if (enabled && !existsSync(chromium.executablePath())) {
  throw new Error(`Chromium not found at ${chromium.executablePath()}; run this in the Playwright image.`);
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface CardMeasure {
  card: Box;
  /** The card's content box: inside the border and the padding. */
  content: { left: number; right: number; width: number };
  cardOverflowsX: boolean;
  badge: Box;
  badgeText: string;
  /** Width the text needs, measured with a Range, against the width it got. */
  badgeTextWidth: number;
  badgeLabelClientWidth: number;
  badgeLabelScrollWidth: number;
  badgeTextOverflow: string;
  badgeFlexShrink: string;
  title: Box;
  titleLines: number;
  buttons: { name: string; box: Box }[];
}

const round = (n: number) => Math.round(n * 100) / 100;

describe.skipIf(!enabled)('Connect surfaces in a real browser', () => {
  let browser: Browser;
  let js = '';
  let css = '';

  beforeAll(async () => {
    const result = await build({
      entryPoints: [resolve(__dirname, 'fixtures/connect-layout-entry.tsx')],
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

  async function withScene<T>(
    scene: string,
    width: number,
    run: (page: Page) => Promise<T>,
    options: { theme?: 'light' | 'dark'; context?: BrowserContextOptions } = {},
  ): Promise<T> {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'reduce',
      ...options.context,
    });
    try {
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: js });
      await page.evaluate(
        ([s, w, t]) =>
          (window as unknown as { upmoScene: (s: string, w: number, t?: string) => void }).upmoScene(s, w, t),
        [scene, width, options.theme ?? 'light'] as const,
      );
      await page.locator('[data-testid="card"], .upmo-brandgrid, .upmo-testconn').first().waitFor();
      // Let fonts and any transition settle so the boxes are at rest.
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await settle(page);
      return await run(page);
    } finally {
      await context.close();
    }
  }

  function settle(page: Page) {
    return page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))).then(
        () => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
      ),
    );
  }

  function measureCard(page: Page, statusText: string): Promise<CardMeasure> {
    return page.evaluate((status) => {
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const card = document.querySelector<HTMLElement>('[data-testid="card"]')!;
      const cs = getComputedStyle(card);
      const padL = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      const padR = parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth);
      const c = card.getBoundingClientRect();

      const badge = [...card.querySelectorAll<HTMLElement>('.mantine-Badge-root')].find(
        (b) => b.textContent?.trim() === status,
      )!;
      const label = badge.querySelector<HTMLElement>('.mantine-Badge-label')!;
      const range = document.createRange();
      range.selectNodeContents(label);

      const title = card.querySelector<HTMLElement>('.mantine-Text-root')!;
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight);

      return {
        card: box(card),
        content: { left: c.left + padL, right: c.right - padR, width: c.width - padL - padR },
        cardOverflowsX: card.scrollWidth > card.clientWidth,
        badge: box(badge),
        badgeText: (label.textContent ?? '').trim(),
        badgeTextWidth: range.getBoundingClientRect().width,
        badgeLabelClientWidth: label.clientWidth,
        badgeLabelScrollWidth: label.scrollWidth,
        badgeTextOverflow: getComputedStyle(label).textOverflow,
        badgeFlexShrink: getComputedStyle(badge).flexShrink,
        title: box(title),
        titleLines: Math.round(title.getBoundingClientRect().height / lineHeight),
        buttons: [...card.querySelectorAll('button')].map((b) => ({
          name: (b.textContent ?? '').trim(),
          box: box(b),
        })),
      };
    }, statusText);
  }

  function report(label: string, m: CardMeasure) {
    console.info(
      `[measure] ${label}: ` +
        JSON.stringify({
          cardWidth: round(m.card.width),
          contentWidth: round(m.content.width),
          badgeText: m.badgeText,
          badgeVisibleWidth: round(m.badgeLabelClientWidth),
          badgeTextNeedsWidth: round(m.badgeTextWidth),
          badgeWidth: round(m.badge.width),
          badgeTruncated: m.badgeLabelScrollWidth > m.badgeLabelClientWidth + 0.5,
          badgeTextOverflow: m.badgeTextOverflow,
          titleLines: m.titleLines,
          buttonTops: m.buttons.map((b) => `${b.name}@${round(b.box.top)}`),
          buttonLefts: m.buttons.map((b) => round(b.box.left - m.content.left)),
          buttonHeights: m.buttons.map((b) => round(b.box.height)),
        }),
    );
  }

  function expectBadgeIntact(m: CardMeasure, text: string) {
    expect(m.badgeText).toBe(text);
    // The label shows all of its text: nothing is clipped...
    expect(m.badgeLabelScrollWidth).toBeLessThanOrEqual(m.badgeLabelClientWidth + 0.5);
    // ...and the label is at least as wide as the text needs.
    expect(m.badgeLabelClientWidth).toBeGreaterThanOrEqual(m.badgeTextWidth - 0.5);
    expect(m.badgeTextOverflow).not.toBe('ellipsis');
    expect(m.badgeFlexShrink).toBe('0');
    // The badge stays inside the card's content box.
    expect(m.badge.right).toBeLessThanOrEqual(m.content.right + 0.5);
    expect(m.cardOverflowsX).toBe(false);
  }

  function expectOneStartAlignedRow(m: CardMeasure, names: string[]) {
    expect(m.buttons.map((b) => b.name)).toEqual(names);
    const tops = m.buttons.map((b) => b.box.top);
    expect(new Set(tops.map(round)).size).toBe(1);
    // Start-aligned: the first button begins at the card's content edge.
    expect(Math.abs(m.buttons[0]!.box.left - m.content.left)).toBeLessThanOrEqual(0.5);
    // In order, with a gap, and inside the content box.
    for (let i = 1; i < m.buttons.length; i += 1) {
      expect(m.buttons[i]!.box.left).toBeGreaterThan(m.buttons[i - 1]!.box.right);
    }
    expect(m.buttons[m.buttons.length - 1]!.box.right).toBeLessThanOrEqual(m.content.right + 0.5);
  }

  describe.each([320, 427, 480, 640])('ConnectorCard at %i px', (width) => {
    it('keeps the Connected badge whole', async () => {
      const m = await withScene('connector', width, (page) => measureCard(page, 'Connected'));
      report(`connector ${width}`, m);
      expectBadgeIntact(m, 'Connected');
    });

    it('puts Edit permissions and Disconnect on one start-aligned row', async () => {
      const m = await withScene('connector', width, (page) => measureCard(page, 'Connected'));
      expectOneStartAlignedRow(m, ['Edit permissions', 'Disconnect']);
      // Small buttons (control-sm, 28px).
      for (const b of m.buttons) expect(b.box.height).toBeLessThan(32);
    });
  });

  describe('ConnectorCard with a long title', () => {
    it('lets the title wrap and keeps the badge whole at 320 px', async () => {
      const m = await withScene('connector-long', 320, (page) => measureCard(page, 'Connected'));
      report('connector long 320', m);
      expectBadgeIntact(m, 'Connected');
      expect(m.titleLines).toBeGreaterThan(1);
      // The title sits to the left of the badge and does not run under it.
      expect(m.title.right).toBeLessThanOrEqual(m.badge.left + 0.5);
    });
  });

  describe('ConnectorCard at a width too narrow for one row', () => {
    it('wraps the actions only then, both still start-aligned', async () => {
      const m = await withScene('connector', 220, (page) => measureCard(page, 'Connected'));
      report('connector 220', m);
      expect(m.buttons).toHaveLength(2);
      expect(m.buttons[1]!.box.top).toBeGreaterThan(m.buttons[0]!.box.bottom - 1);
      // Wrapped, not indented: each button starts at the content edge.
      for (const b of m.buttons) expect(Math.abs(b.box.left - m.content.left)).toBeLessThanOrEqual(0.5);
      expect(m.cardOverflowsX).toBe(false);
    });
  });

  describe.each([
    ['Connected', 'provider-connected'],
    ['Not connected', 'provider-not-connected'],
    ['Rate limited', 'provider-rate-limited'],
    ['Key rejected', 'provider-key-rejected'],
  ])('ProviderCard (%s)', (status, scene) => {
    it.each([320, 427, 640])('keeps the badge whole and the actions on one row at %i px', async (width) => {
      const m = await withScene(scene, width, (page) => measureCard(page, status));
      report(`provider ${status} ${width}`, m);
      expectBadgeIntact(m, status);
      expectOneStartAlignedRow(m, ['Edit', 'Disconnect']);
    });
  });

  describe('ProviderCard with a long name', () => {
    it('lets the name wrap and keeps the badge whole at 320 px', async () => {
      const m = await withScene('provider-long', 320, (page) => measureCard(page, 'Not connected'));
      report('provider long 320', m);
      expectBadgeIntact(m, 'Not connected');
      expect(m.titleLines).toBeGreaterThan(1);
      expect(m.title.right).toBeLessThanOrEqual(m.badge.left + 0.5);
    });
  });

  describe('BrandTileGrid selected and hover', () => {
    interface TileStyle {
      borderColor: string;
      borderWidth: string;
      background: string;
    }

    async function tileStyles(page: Page) {
      const styleOf = (name: string) =>
        page.evaluate((n) => {
          const tile = [...document.querySelectorAll<HTMLElement>('.upmo-brandtile')].find((t) =>
            t.textContent?.includes(n),
          )!;
          const cs = getComputedStyle(tile);
          return { borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, background: cs.backgroundColor };
        }, name);
      // What the tokens resolve to, so the test asserts the tokens and not copies of them.
      const token = (border: string, background: string): Promise<TileStyle> =>
        page.evaluate(
          ([b, bg]) => {
            const el = document.createElement('div');
            el.style.border = `1px solid var(${b})`;
            el.style.background = `var(${bg})`;
            document.body.append(el);
            const cs = getComputedStyle(el);
            const out = { borderColor: cs.borderTopColor, borderWidth: '', background: cs.backgroundColor };
            el.remove();
            return out;
          },
          [border, background] as const,
        );

      const selected = await styleOf('Notion');
      const unselected = await styleOf('GitHub');

      await page.getByRole('button', { name: 'Notion' }).hover();
      await settle(page);
      const selectedHovered = await styleOf('Notion');

      await page.getByRole('button', { name: 'GitHub' }).hover();
      await settle(page);
      const unselectedHovered = await styleOf('GitHub');
      const selectedWhileOtherHovered = await styleOf('Notion');

      return {
        selected,
        unselected,
        selectedHovered,
        unselectedHovered,
        selectedWhileOtherHovered,
        selectedTokens: await token('--emerald-deep', '--surface-selected'),
        hoverTokens: await token('--border-strong', '--surface-hover'),
      };
    }

    function reportTiles(label: string, s: Awaited<ReturnType<typeof tileStyles>>) {
      console.info(
        `[measure] ${label}: ` +
          JSON.stringify({
            selected: s.selected,
            selectedHovered: s.selectedHovered,
            unselected: s.unselected,
            unselectedHovered: s.unselectedHovered,
          }),
      );
    }

    it.each(['light', 'dark'] as const)('keeps the selected style on hover (%s)', async (theme) => {
      const s = await withScene('brandgrid', 720, tileStyles, { theme });
      reportTiles(`brandtile ${theme}`, s);
      // Selected uses the emerald tokens.
      expect(s.selected.borderColor).toBe(s.selectedTokens.borderColor);
      expect(s.selected.background).toBe(s.selectedTokens.background);
      expect(s.selected.borderWidth).toBe('2px');
      // Hovering the selected tile changes nothing.
      expect(s.selectedHovered).toEqual(s.selected);
      expect(s.selectedWhileOtherHovered).toEqual(s.selected);
    });

    it.each(['light', 'dark'] as const)('still shows the hover style on an unselected tile (%s)', async (theme) => {
      const s = await withScene('brandgrid', 720, tileStyles, { theme });
      expect(s.unselectedHovered.borderColor).toBe(s.hoverTokens.borderColor);
      expect(s.unselectedHovered.background).toBe(s.hoverTokens.background);
      expect(s.unselectedHovered.borderWidth).toBe('1px');
      expect(s.unselectedHovered).not.toEqual(s.unselected);
      expect(s.unselectedHovered.borderColor).not.toBe(s.selected.borderColor);
    });

    it('keeps selected distinct from hover in forced-colors mode', async () => {
      const s = await withScene('brandgrid', 720, tileStyles, { context: { forcedColors: 'active' } });
      reportTiles('brandtile forced-colors', s);
      expect(s.selectedHovered).toEqual(s.selected);
      expect(s.selected.borderWidth).toBe('2px');
      // The selected border and a hovered unselected border are different system colours.
      expect(s.unselectedHovered.borderColor).not.toBe(s.selected.borderColor);
      expect(s.unselectedHovered.borderWidth).toBe('1px');
    });
  });

  describe('TestConnectionPanel', () => {
    function measurePanel(page: Page) {
      return page.evaluate(() => {
        const box = (el: Element) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, right: r.right, width: r.width, height: r.height };
        };
        const panel = document.querySelector('.upmo-testconn')!;
        return {
          panel: box(panel),
          button: box(panel.querySelector('button')!),
          status: box(panel.querySelector('.upmo-testconn__status')!),
        };
      });
    }

    it('sizes the button to its content and keeps the status full width', async () => {
      const m = await withScene('testconn', 420, measurePanel);
      console.info(
        `[measure] testconn: ${JSON.stringify({
          panelWidth: round(m.panel.width),
          buttonWidth: round(m.button.width),
          statusWidth: round(m.status.width),
        })}`,
      );
      expect(m.button.width).toBeLessThan(m.panel.width / 2);
      expect(Math.abs(m.button.left - m.panel.left)).toBeLessThanOrEqual(0.5);
      expect(m.status.width).toBeCloseTo(m.panel.width, 0);
    });

    it('stretches the button only with the full-width class', async () => {
      const m = await withScene('testconn-full', 420, measurePanel);
      expect(m.button.width).toBeCloseTo(m.panel.width, 0);
      expect(m.status.width).toBeCloseTo(m.panel.width, 0);
    });
  });
});
