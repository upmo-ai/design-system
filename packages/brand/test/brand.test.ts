import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { mark, markStrokeWidth, markViewBox } from '../src/geometry.ts';
import {
  appIconReach,
  appIconSvg,
  buildRasters,
  buildSvgFiles,
  fillsFor,
  headHtml,
  iconMarkShare,
  maskableMarkShare,
  maskableSafeRadius,
  mirrors,
  ogSize,
  ogSvg,
  palette,
  toIco,
  tokenColour,
  variants,
  wordmarkSvg,
} from '../scripts/lib.ts';

const pkg = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const repo = join(pkg, '..', '..');
const tokens = JSON.parse(readFileSync(join(repo, 'packages/tokens/tokens.json'), 'utf8'));
const themes = { light: palette(tokens, 'light'), dark: palette(tokens, 'dark') };
const read = (path: string) => readFileSync(join(pkg, path));
const text = (path: string) => read(path).toString('utf8');

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function pngSize(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(0, 8).equals(pngSignature)).toBe(true);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe('wordmark and caret colours', () => {
  it('reads light and dark fills from the tokens, not from literals', () => {
    for (const theme of ['light', 'dark'] as const) {
      const svg = text(`assets/svg/wordmark-${theme}.svg`);
      expect(svg).toContain(`fill="${tokenColour(tokens, 'emerald', theme)}"`);
      expect(svg).toContain(`fill="${tokenColour(tokens, 'ink', theme)}"`);
      expect(svg).toContain(`stroke="${tokenColour(tokens, 'emerald', theme)}"`);
    }
  });

  it('draws the up and the caret in the same green, so they read as one mark', () => {
    for (const theme of ['light', 'dark'] as const) {
      const fills = fillsFor(theme, themes);
      expect(fills.up).toBe(fills.caret);
      expect(fills.mo).not.toBe(fills.up);
    }
  });

  it('draws the mono variants in a single colour', () => {
    const expected = { mono: 'currentColor', 'mono-black': 'black', 'mono-white': 'white' } as const;
    for (const [variant, colour] of Object.entries(expected)) {
      for (const name of ['wordmark', 'caret']) {
        const svg = text(`assets/svg/${name}-${variant}.svg`);
        expect(svg).toContain(colour);
        expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      }
    }
  });

  it('ships the wordmark and the caret in every variant', () => {
    for (const variant of variants) {
      expect(existsSync(join(pkg, `assets/svg/wordmark-${variant}.svg`))).toBe(true);
      expect(existsSync(join(pkg, `assets/svg/caret-${variant}.svg`))).toBe(true);
    }
  });

  it('gives every SVG an accessible name and no scripts, styles or fixed size', () => {
    for (const name of readdirSync(join(pkg, 'assets/svg'))) {
      const svg = text(`assets/svg/${name}`);
      expect(svg, name).toContain('role="img"');
      expect(svg, name).toContain('aria-label="Upmo"');
      expect(svg, name).toContain('<title>Upmo</title>');
      expect(svg, name).not.toMatch(/<(script|style|image|text)\b/);
      expect(svg, name).not.toMatch(/\s(width|height)=/);
    }
  });

  it('fails clearly when a token is missing', () => {
    expect(() => tokenColour(tokens, 'no-such-colour', 'light')).toThrow(/no-such-colour/);
  });
});

describe('geometry', () => {
  it('matches the caret mark that @upmo-ai/icons ships', () => {
    const caret = readFileSync(join(repo, 'packages/icons/assets/caret.svg'), 'utf8');
    expect(caret).toContain(`viewBox="${markViewBox}"`);
    expect(caret).toContain(`d="${mark}"`);
    expect(caret).toContain(`stroke-width="${markStrokeWidth}"`);
  });

  it('draws the same outline in every wordmark variant', () => {
    const outlines = variants.map((v) => text(`assets/svg/wordmark-${v}.svg`).match(/ d="([^"]+)"/g));
    for (const outline of outlines) expect(outline).toEqual(outlines[0]);
  });
});

describe('favicon', () => {
  it('recolours itself for dark browsers', () => {
    const svg = text('assets/web/favicon.svg');
    expect(svg).toContain('prefers-color-scheme:dark');
    expect(svg).toContain(themes.light.emerald);
    expect(svg).toContain(themes.dark.emerald);
  });

  it('packs 16, 32 and 48 pixel PNGs into favicon.ico', () => {
    const ico = read('assets/web/favicon.ico');
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    const count = ico.readUInt16LE(4);
    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;
      const size = ico.readUInt8(entry);
      sizes.push(size);
      const length = ico.readUInt32LE(entry + 8);
      const image = ico.subarray(ico.readUInt32LE(entry + 12), ico.readUInt32LE(entry + 12) + length);
      expect(pngSize(image)).toEqual({ width: size, height: size });
    }
    expect(sizes).toEqual([16, 32, 48]);
  });
});

describe('toIco', () => {
  it('writes the directory with correct offsets and lengths', () => {
    const a = Buffer.from('aaaa');
    const b = Buffer.from('bbbbbb');
    const ico = toIco([
      { size: 16, png: a },
      { size: 256, png: b },
    ]);
    expect(ico.readUInt16LE(4)).toBe(2);
    expect(ico.readUInt8(6)).toBe(16);
    expect(ico.readUInt8(6 + 16)).toBe(0);
    expect(ico.readUInt32LE(6 + 8)).toBe(4);
    expect(ico.readUInt32LE(6 + 12)).toBe(38);
    expect(ico.subarray(38, 42).toString()).toBe('aaaa');
    expect(ico.subarray(42).toString()).toBe('bbbbbb');
  });

  it('rejects an image too large for the format', () => {
    expect(() => toIco([{ size: 512, png: Buffer.alloc(1) }])).toThrow(/256/);
  });
});

describe('app icons', () => {
  it('ships the sizes the platforms ask for', () => {
    expect(pngSize(read('assets/web/apple-touch-icon.png'))).toEqual({ width: 180, height: 180 });
    expect(pngSize(read('assets/web/icon-192.png'))).toEqual({ width: 192, height: 192 });
    expect(pngSize(read('assets/web/icon-512.png'))).toEqual({ width: 512, height: 512 });
    expect(pngSize(read('assets/web/icon-512-maskable.png'))).toEqual({ width: 512, height: 512 });
  });

  it('paints a full-bleed ground, so the icon is opaque', () => {
    for (const share of [iconMarkShare, maskableMarkShare]) {
      const svg = appIconSvg(themes, share);
      expect(svg).toContain(`<rect width="512" height="512" fill="${themes.light.ground}"/>`);
    }
  });

  it('keeps the maskable icon inside the safe circle, and the standard icon in the canvas', () => {
    expect(appIconReach(maskableMarkShare)).toBeLessThanOrEqual(maskableSafeRadius);
    expect(appIconReach(iconMarkShare)).toBeLessThan(256);
    expect(appIconReach(maskableMarkShare)).toBeLessThan(appIconReach(iconMarkShare));
  });

  it('centres the caret on its drawn bounds', () => {
    const svg = appIconSvg(themes, iconMarkShare);
    const [, tx, ty, scale] = svg.match(/translate\(([\d.-]+) ([\d.-]+)\) scale\(([\d.-]+)\)/)!.map(Number);
    expect(tx + 32 * scale).toBeCloseTo(256, 1);
    expect(ty + 33 * scale).toBeCloseTo(256, 1);
  });
});

describe('social share image', () => {
  it('is 1200 by 630', () => {
    expect(ogSize).toEqual({ width: 1200, height: 630 });
    expect(pngSize(read('assets/web/og.png'))).toEqual({ width: 1200, height: 630 });
  });

  it('carries the wordmark alone, with no text or tagline', () => {
    const svg = ogSvg(themes);
    expect(svg).not.toMatch(/<(text|tspan|image)\b/);
    expect(svg.match(/<path /g)).toHaveLength(3);
  });
});

describe('web manifest and head snippet', () => {
  const manifest = JSON.parse(text('assets/web/site.webmanifest'));

  it('lists icons that exist, with a separate maskable entry', () => {
    for (const icon of manifest.icons) {
      expect(existsSync(join(pkg, 'assets/web', icon.src.replace(/^\//, ''))), icon.src).toBe(true);
    }
    const purposes = manifest.icons.map((i: { purpose?: string }) => i.purpose ?? 'any');
    expect(purposes).toEqual(['any', 'any', 'maskable']);
  });

  it('uses the light page ground from the tokens', () => {
    expect(manifest.background_color).toBe(themes.light.ground);
    expect(manifest.theme_color).toBe(themes.light.ground);
  });

  it('links only files that exist in the kit', () => {
    const hrefs = [...headHtml(themes).matchAll(/(?:href|content)="(\/[^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(expect.arrayContaining(['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/site.webmanifest']));
    for (const href of hrefs) expect(existsSync(join(pkg, 'assets/web', href.slice(1))), href).toBe(true);
  });

  it('leaves the origin of the share image for the app to fill in', () => {
    expect(headHtml(themes)).toContain('content="{{origin}}/og.png"');
  });
});

describe('generated files', () => {
  it('match what the generator writes, so nothing is edited by hand', () => {
    for (const [path, expected] of buildSvgFiles(tokens)) expect(text(path), path).toBe(expected);
    for (const [target, source] of Object.entries(mirrors)) {
      expect(readFileSync(join(repo, target), 'utf8'), target).toBe(text(source));
    }
  });

  it('are the only files in the generated directories', () => {
    const expected = new Set([...buildSvgFiles(tokens).keys(), ...buildRasters(tokens).keys(), 'assets/web/favicon.ico']);
    const found = ['assets/svg', 'assets/web'].flatMap((dir) => readdirSync(join(pkg, dir)).map((name) => `${dir}/${name}`));
    expect(new Set(found)).toEqual(expected);
  });

  it('draws every wordmark from the committed geometry', () => {
    expect(wordmarkSvg(fillsFor('light', themes))).toBe(text('assets/svg/wordmark-light.svg'));
  });
});

// The package is files only. These tests resolve names the way a consumer's
// bundler does, through the exports map, so they need `pnpm build` first.
describe('package exports', () => {
  const manifest = JSON.parse(text('package.json'));
  const resolveExport = createRequire(import.meta.url).resolve;
  const failureCode = (specifier: string): unknown => {
    try {
      resolveExport(specifier);
    } catch (err) {
      return (err as { code?: string }).code;
    }
    return undefined;
  };

  it('exposes the svg and web files and package.json, and nothing else', () => {
    expect(Object.keys(manifest.exports).sort()).toEqual(['./package.json', './svg/*', './web/*']);
    expect(manifest.main).toBeUndefined();
    expect(manifest.types).toBeUndefined();
  });

  it('has no root entry, so importing the bare package name fails clearly', () => {
    expect(failureCode('@upmo-ai/brand')).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
  });

  it('resolves every kit file to an identical copy in dist', () => {
    for (const dir of ['svg', 'web']) {
      for (const name of readdirSync(join(pkg, 'assets', dir))) {
        const resolved = resolveExport(`@upmo-ai/brand/${dir}/${name}`);
        expect(resolved, name).toBe(join(pkg, 'dist', dir, name));
        expect(readFileSync(resolved).equals(read(`assets/${dir}/${name}`)), name).toBe(true);
      }
    }
  });

  it('resolves package.json, so tools can read the version', () => {
    expect(resolveExport('@upmo-ai/brand/package.json')).toBe(join(pkg, 'package.json'));
  });

  it('ships dist only, so the geometry source stays out of the tarball and out of the exports', () => {
    expect(manifest.files).toEqual(['dist']);
    expect(existsSync(join(pkg, 'dist/geometry.ts'))).toBe(false);
    expect(failureCode('@upmo-ai/brand/geometry')).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
    expect(failureCode('@upmo-ai/brand/src/geometry.ts')).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
  });
});
