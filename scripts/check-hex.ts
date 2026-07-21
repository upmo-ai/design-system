// Fails when component styles or docs source carry a raw hex colour; colours
// come from tokens only. Scans packages/*/src and apps/*/src when present.
import { existsSync, readFileSync } from 'node:fs';
import { findHexColours, listFiles } from './hex.ts';
import { isTextFile } from './terms.ts';

const roots = ['packages', 'apps'];
const srcDirs: string[] = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const file of listFiles(root)) {
    // Only lint hand-written component/doc source, never generated dist or tokens source.
    if (file.includes('/node_modules/')) continue;
    if (file.includes('/dist/')) continue;
    if (file.includes('/.astro/')) continue;
    if (file.endsWith('tokens.json')) continue;
    if (file.endsWith('/src') ) continue;
    if (/\/(src|styles)\//.test(file) && /\.(css|module\.css|tsx|ts)$/.test(file)) srcDirs.push(file);
  }
}

let failures = 0;
let scanned = 0;
for (const file of srcDirs) {
  if (!isTextFile(file)) continue;
  scanned++;
  for (const { line, match } of findHexColours(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}: raw colour ${match}; use a token variable`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-hex: ${scanned} files, no raw hex colours`);
