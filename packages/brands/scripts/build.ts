import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describeBrand, type Brand, svgInner, toModule } from './lib.ts';

const assetsRoot = new URL('../assets/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

const marks: Record<string, string> = {};

// Copies one asset folder into dist/svg/<dir> and describes each mark.
function group(folder: string, dir: string): Brand[] {
  const assets = new URL(`${folder}/`, assetsRoot);
  mkdirSync(new URL(`svg/${dir}`, dist), { recursive: true });
  return readdirSync(assets)
    .filter((f) => f.endsWith('.svg'))
    .sort()
    .map((file) => {
      const svg = readFileSync(new URL(file, assets), 'utf8');
      copyFileSync(new URL(file, assets), new URL(`svg/${dir}${file}`, dist));
      const brand = describeBrand(file, svg, dir);
      const inner = svgInner(svg);
      // The fill lives on the <svg> element in our source; it is lost when we
      // inline only the inner markup. Re-apply it on a wrapping <g>: the brand's
      // official colour normally, or currentColor for deep marks (near-black or
      // near-white) and currentColor marks, so they adapt to the theme.
      const fillMatch = /<svg\b[^>]*\sfill="([^"]+)"/.exec(svg);
      const fill = brand.deep || brand.currentColor ? 'currentColor' : (fillMatch?.[1] ?? 'currentColor');
      marks[brand.id] = `<g fill="${fill}">${inner}</g>`;
      return brand;
    });
}

mkdirSync(dist, { recursive: true });
const manifest = { brands: group('brands', ''), languages: group('languages', 'languages/') };
const { js, dts } = toModule(manifest, marks);
writeFileSync(new URL('brands.json', dist), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(new URL('index.js', dist), js);
writeFileSync(new URL('index.d.ts', dist), dts);

console.log(`brands: ${manifest.brands.length} brands, ${manifest.languages.length} languages`);
