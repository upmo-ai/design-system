import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readMap, toModule, upmoMarks } from './lib.ts';

const src = new URL('../icons.json', import.meta.url);
const assets = new URL('../assets/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const map = readMap(JSON.parse(readFileSync(src, 'utf8')));

// Every Upmo mark named in icons.json (caret, status-*) must have a real SVG
// in assets/, so consumers that render the mark directly always find it.
const missing = upmoMarks(map).filter((name) => !existsSync(new URL(`${name}.svg`, assets)));
if (missing.length) {
  throw new Error(`icons.json names marks with no SVG in assets/: ${missing.join(', ')}`);
}

mkdirSync(new URL('svg/', dist), { recursive: true });
for (const file of readdirSync(assets).filter((f) => f.endsWith('.svg'))) {
  copyFileSync(new URL(file, assets), new URL(`svg/${file}`, dist));
}

const { js, dts } = toModule(map);
writeFileSync(new URL('index.js', dist), js);
writeFileSync(new URL('index.d.ts', dist), dts);
copyFileSync(src, new URL('icons.json', dist));

console.log(
  `icons: ${Object.keys(map.icons).length} concepts, ${upmoMarks(map).length} Upmo mark(s)`,
);
