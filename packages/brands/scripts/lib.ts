export interface Brand {
  id: string;
  file: string;
  // Carries u-brand--deep: drawn in ink on the dark and high-contrast themes.
  deep: boolean;
  // Drawn entirely in currentColor (no fixed colour), so it takes the text colour.
  currentColor: boolean;
}

export interface Manifest {
  brands: Brand[];
  languages: Brand[];
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

// Whether the (single) fixed colour in an SVG is near-greyscale and very dark or
// very light, so it should adapt to the theme rather than sit on one ground.
function isAchromatic(svg: string): boolean {
  const hex = /#([0-9a-f]{6})\b/i.exec(svg)?.[1];
  if (!hex) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const greyish = max - min <= 40; // low saturation
  const extreme = max <= 60 || min >= 200; // very dark or very light
  return greyish && extreme;
}

// The inner markup of an <svg> (everything between the tags), used to inline a
// mark in React without a network request.
export function svgInner(svg: string): string {
  return svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
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
