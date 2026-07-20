// Fails when package or app source uses a word the glossary retires; reword the
// copy, never allowlist it. The gitignored design-notes/ are skipped: they are
// internal reference and legitimately name Timothy's "mission" etc.
import { existsSync, readFileSync } from 'node:fs';
import { listFiles } from './hex.ts';
import { findRetiredWords, isTextFile } from './terms.ts';

const roots = ['packages', 'apps'];
const files: string[] = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const file of listFiles(root)) {
    if (file.includes('/dist/') || file.includes('/node_modules/')) continue;
    files.push(file);
  }
}

let failures = 0;
let scanned = 0;
for (const file of files.filter(isTextFile)) {
  scanned++;
  for (const { line, match } of findRetiredWords(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}: retired word "${match}"; see the glossary`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-terms: ${scanned} files, no retired words`);
