// Fails when content or the handwritten docs use a word the glossary retires; reword the copy, never allowlist it.
import { readFileSync } from 'node:fs';
import { listFiles } from './hex.ts';
import { findRetiredWords, isTextFile } from './terms.ts';

const files = [
  ...listFiles('content', ['content/glossary.md']),
  ...listFiles('apps/docs/src/handwritten'),
].filter(isTextFile);

let failures = 0;
for (const file of files) {
  for (const { line, match } of findRetiredWords(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}: retired word "${match}"; see content/glossary.md`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`check-terms: ${files.length} files, no retired words`);
