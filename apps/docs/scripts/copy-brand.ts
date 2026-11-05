// Copies the brand kit into the docs site's public folder, so the brand page
// can preview the files and offer them for download at /brand/files/. The copy
// is gitignored; packages/brand/assets is the source. Run before astro dev and
// astro build.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../../packages/brand/assets');
const target = resolve(here, '../public/brand/files');

if (!existsSync(source)) {
  throw new Error(`Brand kit missing at ${source}. Generate it first (see packages/brand/README.md).`);
}

rmSync(target, { recursive: true, force: true });
for (const dir of ['svg', 'web']) {
  mkdirSync(resolve(target, dir), { recursive: true });
  for (const file of readdirSync(resolve(source, dir))) {
    copyFileSync(resolve(source, dir, file), resolve(target, dir, file));
  }
}
console.log(`copy-brand: copied the brand kit into ${target}`);
