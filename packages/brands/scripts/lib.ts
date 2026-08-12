export interface Brand {
  id: string;
  file: string;
  // Display name and role, from sources/*.json (languages have neither).
  name?: string;
  kind?: 'provider' | 'connector';
  // Carries u-brand--deep: drawn in ink on the dark and high-contrast themes.
  deep: boolean;
  // Drawn entirely in currentColor (no fixed colour), so it takes the text colour.
  currentColor: boolean;
}

export interface Manifest {
  brands: Brand[];
  languages: Brand[];
}

// Where a mark came from. Every brand mark must have one, so each file can be
// traced back to the artwork the brand itself publishes.
export interface Source {
  name: string;
  kind: 'provider' | 'connector';
  // The exact file that was downloaded.
  source: string;
  // The brand's own brand, press or media-kit page.
  official: string;
  variant: 'color' | 'mono';
  notes?: string;
}

// Marks are inlined into the page, so they may only use plain drawing elements:
// no <style> (it would leak as global CSS), no scripts, images or text, and every
// id and reference stays inside the mark under its own "<id>-" prefix, so two
// marks on one page never share a gradient or clip path.
const allowedElements = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line',
  'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use',
]);
const maxBytes = 16 * 1024;

export function checkMark(id: string, svg: string): string[] {
  const errors: string[] = [];
  const root = /^\s*<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
  if (!/^[a-z0-9]+$/.test(id)) errors.push('id must be lowercase letters and digits');
  if (!/\sviewBox="[^"]+"/.test(root)) errors.push('root <svg> needs a viewBox');
  if (!/\saria-hidden="true"/.test(root)) errors.push('root <svg> needs aria-hidden="true"');
  if (/\s(width|height)=/.test(root)) errors.push('root <svg> must not set width or height');
  for (const [, tag] of svg.matchAll(/<([a-zA-Z][\w:-]*)/g)) {
    if (!allowedElements.has(tag)) errors.push(`<${tag}> is not allowed`);
  }
  if (/\son[a-z]+\s*=/i.test(svg)) errors.push('event handler attribute');
  if (/\sstyle=/.test(svg)) errors.push('style attribute; use presentation attributes');
  for (const [, c] of svg.matchAll(/\sclass="([^"]*)"/g)) {
    if (c !== 'u-brand--deep') errors.push(`class "${c}"`);
  }
  for (const [, v] of svg.matchAll(/\sid="([^"]*)"/g)) {
    if (!v.startsWith(`${id}-`)) errors.push(`id "${v}" must start with "${id}-"`);
  }
  for (const [, v] of svg.matchAll(/href="([^"]*)"/g)) {
    if (!v.startsWith(`#${id}-`)) errors.push(`href "${v}" must point inside the mark`);
  }
  for (const [, v] of svg.matchAll(/url\(([^)]*)\)/g)) {
    if (!v.replace(/['"]/g, '').startsWith(`#${id}-`)) errors.push(`url(${v}) must point inside the mark`);
  }
  if (svg.length > maxBytes) errors.push(`${svg.length} bytes; keep marks under ${maxBytes}`);
  return [...new Set(errors)];
}

export function checkSource(source: Partial<Source> | undefined): string[] {
  if (!source) return ['no entry in sources/*.json'];
  const missing = (['name', 'kind', 'source', 'official', 'variant'] as const).filter((k) => !source[k]);
  return missing.map((k) => `source is missing "${k}"`);
}

// dir is the folder under svg/ the file is published in ('' for brands,
// 'languages/' for language marks).
export function describeBrand(file: string, svg: string, dir = ''): Brand {
  const classes = /<svg\b[^>]*\sclass="([^"]*)"/.exec(svg)?.[1].split(/\s+/) ?? [];
  const currentColor = svg.includes('currentColor') && !/#[0-9a-f]{3,8}\b/i.test(svg);
  return {
    id: file.replace(/\.svg$/, ''),
    // "deep" means the mark should be drawn in ink (currentColor) on dark and
    // high-contrast themes. True when the class opts in, OR when the brand's
    // fixed colour is near-black/near-white (which would vanish on the opposite
    // ground). currentColor marks are already ink-adaptive, so they are not deep.
    deep: classes.includes('u-brand--deep') || (!currentColor && isAchromatic(svg)),
    currentColor,
    file: dir + file,
  };
}

// A fixed colour's tone: saturated colour, or a near-black, near-white or mid
// grey. Near-black and near-white are the tones that vanish on the opposite
// theme's ground.
type Tone = 'colour' | 'dark' | 'light' | 'grey';

function tone(hex: string): Tone {
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min > 40) return 'colour';
  if (max <= 70) return 'dark';
  if (min >= 200) return 'light';
  return 'grey';
}

// Whether every fixed colour in an SVG is near-black (or every one near-white),
// so the mark is effectively one ink and should adapt to the theme rather than
// sit on one ground. A multicolour mark, or one that pairs black with white (a
// tile), keeps its own colours.
function isAchromatic(svg: string): boolean {
  const tones = [...svg.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map(([, h]) => tone(h));
  if (!tones.length) return false;
  return tones.every((t) => t === 'dark') || tones.every((t) => t === 'light');
}

// The inner markup of an <svg> (everything between the tags), used to inline a
// mark in React without a network request.
export function svgInner(svg: string): string {
  return svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
}

// The markup BrandMark inlines inside its own 24x24 <svg>: the mark as a nested
// <svg> that keeps the brand's own viewBox (official files come in every size)
// and scales to fill the box. Deep and currentColor marks draw in currentColor so
// they follow the theme; colourful marks keep their fills.
export function toMark(svg: string, brand: Brand): string {
  const root = /^\s*<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
  const viewBox = /\sviewBox="([^"]+)"/.exec(root)?.[1] ?? '0 0 24 24';
  const ownFill = /\sfill="([^"]+)"/.exec(root)?.[1];
  const fill = brand.deep || brand.currentColor ? 'currentColor' : ownFill;
  let inner = svgInner(svg);
  // A deep mark's near-black (or near-white) parts take the ink; any brand colour
  // beside them (the AWS smile) stays.
  if (brand.deep) {
    inner = inner.replace(/(fill|stroke)="#([0-9a-f]{3,8})"/gi, (attr, name: string, hex: string) =>
      tone(hex) === 'dark' || tone(hex) === 'light' ? `${name}="currentColor"` : attr,
    );
  }
  const fillAttr = fill ? ` fill="${fill}"` : '';
  return `<svg viewBox="${viewBox}" width="24" height="24"${fillAttr}>${inner}</svg>`;
}

export function toModule(
  { brands, languages }: Manifest,
  marks: Record<string, string>,
): { js: string; dts: string } {
  const head =
    '// Generated from assets/brands and assets/languages by scripts/build.ts. Do not edit.\n';
  const union = (list: Brand[]) =>
    list.length ? list.map((b) => JSON.stringify(b.id)).join(' | ') : 'never';
  const js = [
    `export const brands = ${JSON.stringify(brands, null, 2)};`,
    `export const languages = ${JSON.stringify(languages, null, 2)};`,
    // marks: id -> the inner SVG markup, so a React component can inline a mark
    // (colourful or currentColor) without a network request.
    `export const marks = ${JSON.stringify(marks, null, 2)};`,
  ];
  const entry = (name: string, idType: string) => [
    `export interface ${name} {`,
    `  readonly id: ${idType};`,
    '  readonly file: string;',
    '  readonly deep: boolean;',
    '  readonly currentColor: boolean;',
    '  readonly name?: string;',
    "  readonly kind?: 'provider' | 'connector';",
    '}',
  ];
  const dts = [
    `export type BrandId = ${union(brands)};`,
    `export type LanguageId = ${union(languages)};`,
    ...entry('Brand', 'BrandId'),
    ...entry('Language', 'LanguageId'),
    'export declare const brands: readonly Brand[];',
    'export declare const languages: readonly Language[];',
    'export declare const marks: Record<string, string>;',
  ];
  return { js: head + js.join('\n') + '\n', dts: head + dts.join('\n') + '\n' };
}
