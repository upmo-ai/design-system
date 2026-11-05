import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

// The generated files are committed in assets/, so the build only copies them
// into dist/, the way @upmo-ai/icons does. Run `generate` to refresh them.
const assets = new URL('../assets/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

rmSync(dist, { recursive: true, force: true });

const counts: string[] = [];
for (const dir of ['svg', 'web']) {
  const from = new URL(`${dir}/`, assets);
  const to = new URL(`${dir}/`, dist);
  const files = readdirSync(from);
  if (files.length === 0) throw new Error(`assets/${dir} is empty; run the generator (see README.md)`);
  mkdirSync(to, { recursive: true });
  for (const file of files) copyFileSync(new URL(file, from), new URL(file, to));
  counts.push(`${files.length} ${dir} files`);
}

console.log(`brand: copied ${counts.join(' and ')}`);
