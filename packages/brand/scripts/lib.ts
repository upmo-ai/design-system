import {
  caret,
  caretStrokeWidth,
  markCentre,
  markReach,
  mark,
  markStrokeWidth,
  markViewBox,
  markWidth,
  mo,
  up,
  viewBox,
} from '../src/geometry.ts';

export type Theme = 'light' | 'dark';

export interface Palette {
  /** The brand green: the "up" and the caret. */
  emerald: string;
  /** Text ink: the "mo". */
  ink: string;
  /** The page ground the artwork is designed to sit on. */
  ground: string;
}

interface TokenFile {
  color: { tokens: { name: string; value: string | Record<string, string> }[] };
}

/** Reads one themed colour from tokens.json, so no colour is written down twice. */
export function tokenColour(tokens: TokenFile, name: string, theme: Theme): string {
  const token = tokens.color.tokens.find((t) => t.name === name);
  const value = token && typeof token.value === 'object' ? token.value[theme] : undefined;
  if (!value) throw new Error(`tokens.json has no "${name}" colour for the ${theme} theme`);
  return value;
}

export function palette(tokens: TokenFile, theme: Theme): Palette {
  return {
    emerald: tokenColour(tokens, 'emerald', theme),
    ink: tokenColour(tokens, 'ink', theme),
    ground: tokenColour(tokens, 'surface-000', theme),
  };
}

/** The fills a wordmark or caret variant is drawn with. */
export interface Fills {
  up: string;
  mo: string;
  caret: string;
}

export const variants = ['light', 'dark', 'mono', 'mono-black', 'mono-white'] as const;
export type Variant = (typeof variants)[number];

export function fillsFor(variant: Variant, themes: Record<Theme, Palette>): Fills {
  switch (variant) {
    case 'light':
    case 'dark': {
      const p = themes[variant];
      return { up: p.emerald, mo: p.ink, caret: p.emerald };
    }
    case 'mono':
      return { up: 'currentColor', mo: 'currentColor', caret: 'currentColor' };
    case 'mono-black':
      return { up: 'black', mo: 'black', caret: 'black' };
    case 'mono-white':
      return { up: 'white', mo: 'white', caret: 'white' };
  }
}

const xmlns = 'xmlns="http://www.w3.org/2000/svg"';
const title = '<title>Upmo</title>';

export function wordmarkSvg(fills: Fills): string {
  return (
    `<svg ${xmlns} viewBox="${viewBox}" role="img" aria-label="Upmo">${title}` +
    `<path fill="${fills.up}" d="${up}"/>` +
    `<path fill="${fills.mo}" d="${mo}"/>` +
    `<path d="${caret}" fill="none" stroke="${fills.caret}" stroke-width="${caretStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
}

export function caretSvg(fills: Fills): string {
  return (
    `<svg ${xmlns} viewBox="${markViewBox}" role="img" aria-label="Upmo">${title}` +
    `<path d="${mark}" fill="none" stroke="${fills.caret}" stroke-width="${markStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
}

// A square viewBox cropped to the drawn caret, centred on it. Used where the
// mark stands alone with no ground, such as a browser tab.
const tabSide = 62;
const tabViewBox = `${markCentre.x - tabSide / 2} ${markCentre.y - tabSide / 2} ${tabSide} ${tabSide}`;

/** The favicon: the caret on a transparent ground, recoloured for dark browsers. */
export function faviconSvg(themes: Record<Theme, Palette>): string {
  return (
    `<svg ${xmlns} viewBox="${tabViewBox}">` +
    `<style>path{stroke:${themes.light.emerald}}` +
    `@media (prefers-color-scheme:dark){path{stroke:${themes.dark.emerald}}}</style>` +
    `<path d="${mark}" fill="none" stroke-width="${markStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
}

/** The caret as a flat, single-colour SVG, for the sizes inside favicon.ico. */
export function tabIconSvg(colour: string): string {
  return (
    `<svg ${xmlns} viewBox="${tabViewBox}">` +
    `<path d="${mark}" fill="none" stroke="${colour}" stroke-width="${markStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
}

const iconSide = 512;
/** The share of the canvas width the caret spans in the standard app icons. */
export const iconMarkShare = 0.72;
/** The same for the maskable icon, which must sit inside the central safe circle. */
export const maskableMarkShare = 0.6;
// Maskable icons are cropped to a shape; the platform guarantees only a circle
// of 40% of the width around the centre.
export const maskableSafeRadius = iconSide * 0.4;

/** A square app icon: the caret in emerald on the light page ground, full bleed. */
export function appIconSvg(themes: Record<Theme, Palette>, share: number): string {
  const scale = (share * iconSide) / markWidth;
  const x = iconSide / 2 - markCentre.x * scale;
  const y = iconSide / 2 - markCentre.y * scale;
  return (
    `<svg ${xmlns} viewBox="0 0 ${iconSide} ${iconSide}">` +
    `<rect width="${iconSide}" height="${iconSide}" fill="${themes.light.ground}"/>` +
    `<path transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" d="${mark}" fill="none" ` +
    `stroke="${themes.light.emerald}" stroke-width="${markStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
}

/** How far the caret reaches from the icon centre, in icon pixels. */
export function appIconReach(share: number): number {
  return markReach * ((share * iconSide) / markWidth);
}

export const ogSize = { width: 1200, height: 630 };
/** The share of the image width the wordmark spans. */
export const ogWordmarkShare = 0.46;

/** The social share image: the wordmark alone, centred on the light page ground. */
export function ogSvg(themes: Record<Theme, Palette>): string {
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
  const scale = (ogSize.width * ogWordmarkShare) / vw;
  const x = ogSize.width / 2 - (vx + vw / 2) * scale;
  const y = ogSize.height / 2 - (vy + vh / 2) * scale;
  const p = themes.light;
  return (
    `<svg ${xmlns} viewBox="0 0 ${ogSize.width} ${ogSize.height}">` +
    `<rect width="${ogSize.width}" height="${ogSize.height}" fill="${p.ground}"/>` +
    `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})">` +
    `<path fill="${p.emerald}" d="${up}"/><path fill="${p.ink}" d="${mo}"/>` +
    `<path d="${caret}" fill="none" stroke="${p.emerald}" stroke-width="${caretStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></g></svg>\n`
  );
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Packs PNG images into one ICO file. Every image keeps its PNG bytes, which
 * all current browsers read, so no bitmap encoder is needed.
 */
export function toIco(images: { size: number; png: Uint8Array }[]): Buffer {
  const headerSize = 6 + images.length * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = headerSize;
  images.forEach(({ size, png }, i) => {
    if (size < 1 || size > 256) throw new Error(`ICO images are 1 to 256 pixels, got ${size}`);
    const entry = 6 + i * 16;
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

export function webManifest(themes: Record<Theme, Palette>): string {
  const manifest = {
    name: 'Upmo',
    short_name: 'Upmo',
    start_url: '/',
    display: 'standalone',
    background_color: themes.light.ground,
    theme_color: themes.light.ground,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return JSON.stringify(manifest, null, 2) + '\n';
}

/** The tags for a page head. `{{origin}}` stands for the absolute site origin. */
export function headHtml(themes: Record<Theme, Palette>): string {
  return (
    [
      '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
      '<link rel="icon" href="/favicon.ico" sizes="48x48">',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
      '<link rel="manifest" href="/site.webmanifest">',
      `<meta name="theme-color" content="${themes.light.ground}">`,
      '<meta property="og:image" content="{{origin}}/og.png">',
      '<meta property="og:image:type" content="image/png">',
      `<meta property="og:image:width" content="${ogSize.width}">`,
      `<meta property="og:image:height" content="${ogSize.height}">`,
      '<meta property="og:image:alt" content="Upmo">',
    ].join('\n') + '\n'
  );
}

export interface Raster {
  /** The SVG to draw. */
  svg: string;
  /** The output width in pixels; the height follows. */
  width: number;
}

/** The SVG text files, keyed by path relative to the package. */
export function buildSvgFiles(tokens: TokenFile): Map<string, string> {
  const themes = { light: palette(tokens, 'light'), dark: palette(tokens, 'dark') };
  const files = new Map<string, string>();
  for (const variant of variants) {
    const fills = fillsFor(variant, themes);
    files.set(`assets/svg/wordmark-${variant}.svg`, wordmarkSvg(fills));
    files.set(`assets/svg/caret-${variant}.svg`, caretSvg(fills));
  }
  files.set('assets/web/favicon.svg', faviconSvg(themes));
  files.set('assets/web/site.webmanifest', webManifest(themes));
  files.set('assets/web/head.html', headHtml(themes));
  return files;
}

/** The PNGs to draw, keyed by path relative to the package. */
export function buildRasters(tokens: TokenFile): Map<string, Raster> {
  const themes = { light: palette(tokens, 'light'), dark: palette(tokens, 'dark') };
  const standard = appIconSvg(themes, iconMarkShare);
  return new Map<string, Raster>([
    ['assets/web/apple-touch-icon.png', { svg: standard, width: 180 }],
    ['assets/web/icon-192.png', { svg: standard, width: 192 }],
    ['assets/web/icon-512.png', { svg: standard, width: 512 }],
    ['assets/web/icon-512-maskable.png', { svg: appIconSvg(themes, maskableMarkShare), width: 512 }],
    ['assets/web/og.png', { svg: ogSvg(themes), width: ogSize.width }],
  ]);
}

export const icoSizes = [16, 32, 48];

/** The flat caret drawn into favicon.ico, in the light-theme emerald. */
export function icoSource(tokens: TokenFile): string {
  return tabIconSvg(palette(tokens, 'light').emerald);
}

/**
 * Copies of generated files that live outside the package, because another
 * part of the repo uses them directly. Keyed by path relative to the repo root.
 */
export const mirrors: Record<string, string> = {
  'apps/docs/src/assets/upmo-wordmark-light.svg': 'assets/svg/wordmark-light.svg',
  'apps/docs/src/assets/upmo-wordmark-dark.svg': 'assets/svg/wordmark-dark.svg',
  'apps/docs/public/favicon.svg': 'assets/web/favicon.svg',
};
