import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { checkAliases, checkMark, checkSource, describeBrand, type Brand, type Source, toMark, toModule } from './lib.ts';

const assetsRoot = new URL('../assets/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

const marks: Record<string, string> = {};
const errors: string[] = [];

// Provenance for every brand mark, one file per brand family.
const sourcesDir = new URL('../sources/', import.meta.url);
const sources: Record<string, Source> = {};
for (const file of readdirSync(sourcesDir).filter((f) => f.endsWith('.json')).sort()) {
  Object.assign(sources, JSON.parse(readFileSync(new URL(file, sourcesDir), 'utf8')));
}

// Copies one asset folder into dist/svg/<dir> and describes each mark. Brand
// marks must also name their source; language marks are our own.
function group(folder: string, dir: string, sourced: boolean): Brand[] {
  const assets = new URL(`${folder}/`, assetsRoot);
  mkdirSync(new URL(`svg/${dir}`, dist), { recursive: true });
  return readdirSync(assets)
    .filter((f) => f.endsWith('.svg'))
    .sort()
    .map((file) => {
      const svg = readFileSync(new URL(file, assets), 'utf8');
      copyFileSync(new URL(file, assets), new URL(`svg/${dir}${file}`, dist));
      const brand = describeBrand(file, svg, dir);
      const problems = checkMark(brand.id, svg);
      if (sourced) {
        const source = sources[brand.id];
        problems.push(...checkSource(source));
        if (source) Object.assign(brand, { name: source.name, kind: source.kind });
      }
      errors.push(...problems.map((p) => `${folder}/${file}: ${p}`));
      marks[brand.id] = toMark(svg, brand);
      return brand;
    });
}

mkdirSync(dist, { recursive: true });
const manifest = { brands: group('brands', '', true), languages: group('languages', 'languages/', false) };
// Alternative ids for marks, checked against the marks that exist.
const aliases: Record<string, string> = JSON.parse(
  readFileSync(new URL('../aliases.json', import.meta.url), 'utf8'),
);
errors.push(
  ...checkAliases(
    aliases,
    manifest.brands.map((b) => b.id),
    manifest.languages.map((l) => l.id),
  ).map((p) => `aliases.json: ${p}`),
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const { js, dts } = toModule(manifest, marks, aliases);
writeFileSync(new URL('brands.json', dist), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(new URL('index.js', dist), js);
writeFileSync(new URL('index.d.ts', dist), dts);

console.log(`brands: ${manifest.brands.length} brands, ${manifest.languages.length} languages, ${Object.keys(aliases).length} aliases`);
