export interface Brand {
  id: string;
  file: string;
  // Carries u-brand--deep: drawn in ink on the dark and hc themes.
  deep: boolean;
  // Drawn entirely in currentColor (no fixed colour), so it takes the text colour.
  currentColor: boolean;
}

export interface Manifest {
  brands: Brand[];
  languages: Brand[];
}

// dir is the folder under svg/ the file is published in ('' for brands, 'languages/' for language marks).
export function describeBrand(file: string, svg: string, dir = ''): Brand {
  const classes = /<svg\b[^>]*\sclass="([^"]*)"/.exec(svg)?.[1].split(/\s+/) ?? [];
  return {
    id: file.replace(/\.svg$/, ''),
    file: dir + file,
    deep: classes.includes('u-brand--deep'),
    currentColor: svg.includes('currentColor') && !/#[0-9a-f]{3,8}\b/i.test(svg),
  };
}

export function toModule({ brands, languages }: Manifest): { js: string; dts: string } {
  const head = '// Generated from content/assets/brands and content/assets/languages by scripts/build.ts. Do not edit.\n';
  const union = (list: Brand[]) => list.map((b) => JSON.stringify(b.id)).join(' | ');
  const js = [`export const brands = ${JSON.stringify(brands, null, 2)};`, `export const languages = ${JSON.stringify(languages, null, 2)};`];
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
  ];
  return { js: head + js.join('\n') + '\n', dts: head + dts.join('\n') + '\n' };
}
