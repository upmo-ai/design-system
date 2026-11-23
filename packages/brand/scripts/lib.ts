import {
  caret,
  caretStrokeWidth,
  markCentre,
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

const iconSide = 512;
/**
 * The square mark: the caret over the wordmark on a full-bleed square, for
 * profile pictures and app icons. light and dark paint the art in the page
 * ground on emerald. The mono variants knock the art out of a solid square, so
 * the ground shows through it.
 */
// The art stays inside the 40% safe circle that maskable icons guarantee (the
// farthest point, the foot of the "u", is about 190 of the 205 pixels allowed),
// so one drawing serves the profile picture and every app icon.
export function squareSvg(variant: Variant, themes: Record<Theme, Palette>): string {
  const side = iconSide;
  // The caret spans 37.5% of the square, the wordmark 56%, centred on "up" to "mo" (5.5 to 242.3).
  const caretScale = (0.375 * side) / markWidth;
  const cx = side / 2 - markCentre.x * caretScale;
  const cy = 0.33 * side - markCentre.y * caretScale;
  const wordScale = (0.56 * side) / (242.33 - 5.5);
  const wx = side / 2 - ((5.5 + 242.33) / 2) * wordScale;
  const wy = 0.74 * side;
  const art = (colour: string) =>
    `<path transform="translate(${round(cx)} ${round(cy)}) scale(${round(caretScale)})" d="${mark}" fill="none" ` +
    `stroke="${colour}" stroke-width="${markStrokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<g transform="translate(${round(wx)} ${round(wy)}) scale(${round(wordScale)})" fill="${colour}">` +
    `<path d="${up}"/><path d="${mo}"/>` +
    `<path d="${caret}" fill="none" stroke="${colour}" stroke-width="${caretStrokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const open = `<svg ${xmlns} viewBox="0 0 ${side} ${side}" role="img" aria-label="Upmo">${title}`;
  if (variant === 'light' || variant === 'dark') {
    const p = themes[variant];
    return `${open}<rect width="${side}" height="${side}" fill="${p.emerald}"/>${art(p.ground)}</svg>\n`;
  }
  const solid = fillsFor(variant, themes).up;
  return (
    `${open}<mask id="art"><rect width="${side}" height="${side}" fill="white"/>${art('black')}</mask>` +
    `<rect width="${side}" height="${side}" fill="${solid}" mask="url(#art)"/></svg>\n`
  );
}

/** The profile picture and app icons: the light square mark. */
export const profileSvg = (themes: Record<Theme, Palette>) => squareSvg('light', themes);

/** The favicon: the caret in the page ground on a full-bleed emerald square. */
export function faviconSvg(themes: Record<Theme, Palette>): string {
  const p = themes.light;
  const side = iconSide;
  const scale = (0.6 * side) / markWidth;
  const x = side / 2 - markCentre.x * scale;
  const y = side / 2 - markCentre.y * scale;
  return (
    `<svg ${xmlns} viewBox="0 0 ${side} ${side}">` +
    `<rect width="${side}" height="${side}" fill="${p.emerald}"/>` +
    `<path transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" d="${mark}" fill="none" ` +
    `stroke="${p.ground}" stroke-width="${markStrokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
  );
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
    files.set(`assets/svg/square-${variant}.svg`, squareSvg(variant, themes));
  }
  files.set('assets/web/favicon.svg', faviconSvg(themes));
  files.set('assets/web/profile.svg', profileSvg(themes));
  files.set('assets/web/site.webmanifest', webManifest(themes));
  files.set('assets/web/head.html', headHtml(themes));
  return files;
}

/** The PNGs to draw, keyed by path relative to the package. */
export function buildRasters(tokens: TokenFile): Map<string, Raster> {
  const themes = { light: palette(tokens, 'light'), dark: palette(tokens, 'dark') };
  const profile = profileSvg(themes);
  return new Map<string, Raster>([
    ['assets/web/apple-touch-icon.png', { svg: profile, width: 180 }],
    ['assets/web/icon-192.png', { svg: profile, width: 192 }],
    ['assets/web/icon-512.png', { svg: profile, width: 512 }],
    ['assets/web/icon-512-maskable.png', { svg: profile, width: 512 }],
    ['assets/web/profile-1024.png', { svg: profile, width: 1024 }],
    ['assets/web/og.png', { svg: ogSvg(themes), width: ogSize.width }],
  ]);
}

export const icoSizes = [16, 32, 48];

/** The favicon drawn into favicon.ico. */
export function icoSource(tokens: TokenFile): string {
  return faviconSvg({ light: palette(tokens, 'light'), dark: palette(tokens, 'dark') });
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
