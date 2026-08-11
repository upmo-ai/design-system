// Fails when component styles carry a raw px/rem font-size; type sizes come
// from the --text-* tokens only. Scans packages/components/src CSS.
import { readFileSync } from 'node:fs';
import { listFiles } from './hex.ts';
import { findRawFontSizes } from './type.ts';

const files = listFiles('packages/components/src').filter((file) => file.endsWith('.css'));

let failures = 0;
for (const file of files) {
  for (const { line, match } of findRawFontSizes(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}: raw ${match}; use a --text-* size token`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-type: ${files.length} files, no raw font sizes`);
