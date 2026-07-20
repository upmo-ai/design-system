// Fails when component styles or the docs source carry a raw hex colour; colours come from tokens only.
import { readFileSync } from 'node:fs';
import { findHexColours, listFiles } from './hex.ts';

const files = [
  'content/components/bundle.css',
  ...listFiles('apps/docs/src', ['apps/docs/src/content/docs']),
];

let failures = 0;
for (const file of files) {
  for (const { line, match } of findHexColours(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}: raw colour ${match}; use a token variable`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-hex: ${files.length} files, no raw hex colours`);
