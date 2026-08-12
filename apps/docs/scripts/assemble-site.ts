// Assembles the deployable docs site: the Starlight build in dist/, with the
// Storybook gallery nested at dist/storybook/. The docs link live component
// previews to /storybook/, so a production deploy must carry both. Run after
// both `astro build` (this app) and `storybook build` (@upmo-ai/storybook).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docsDist = resolve(here, '../dist');
const storybookStatic = resolve(here, '../../storybook/storybook-static');
const target = resolve(docsDist, 'storybook');

if (!existsSync(docsDist)) {
  throw new Error(`Docs build missing at ${docsDist}. Run astro build first.`);
}
if (!existsSync(storybookStatic)) {
  throw new Error(`Storybook build missing at ${storybookStatic}. Run storybook build first.`);
}

rmSync(target, { recursive: true, force: true });
cpSync(storybookStatic, target, { recursive: true });
console.log(`assemble-site: copied Storybook into ${target}`);
