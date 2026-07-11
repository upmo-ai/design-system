import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describeBrand, toModule } from './lib.ts';

const content = new URL('../../../content/assets/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

// Copies one asset folder into dist/svg/<dir> and describes each mark.
const group = (folder: string, dir: string) => {
  const assets = new URL(`${folder}/`, content);
  mkdirSync(new URL(`svg/${dir}`, dist), { recursive: true });
  return readdirSync(assets)
    .filter((f) => f.endsWith('.svg'))
    .sort()
    .map((file) => {
      copyFileSync(new URL(file, assets), new URL(`svg/${dir}${file}`, dist));
      return describeBrand(file, readFileSync(new URL(file, assets), 'utf8'), dir);
    });
};

const manifest = { brands: group('brands', ''), languages: group('languages', 'languages/') };
const { js, dts } = toModule(manifest);
writeFileSync(new URL('brands.json', dist), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(new URL('index.js', dist), js);
writeFileSync(new URL('index.d.ts', dist), dts);
