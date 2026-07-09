import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readMap, toModule, upmoMarks } from './lib.ts';

const src = new URL('../icons.json', import.meta.url);
const assets = new URL('../../../content/assets/icons/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const map = readMap(JSON.parse(readFileSync(src, 'utf8')));

const missing = upmoMarks(map).filter((name) => !existsSync(new URL(`${name}.svg`, assets)));
if (missing.length) throw new Error(`icons.json names marks with no SVG in content/assets/icons: ${missing.join(', ')}`);

mkdirSync(new URL('svg/', dist), { recursive: true });
for (const file of readdirSync(assets).filter((f) => f.endsWith('.svg'))) {
  copyFileSync(new URL(file, assets), new URL(`svg/${file}`, dist));
}
const { js, dts } = toModule(map);
writeFileSync(new URL('index.js', dist), js);
writeFileSync(new URL('index.d.ts', dist), dts);
copyFileSync(src, new URL('icons.json', dist));
