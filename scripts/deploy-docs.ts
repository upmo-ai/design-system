#!/usr/bin/env node
// Builds the combined docs+Storybook site and deploys it to Cloudflare Pages.
//
// Usage:
//   node scripts/deploy-docs.ts            # production -> design.upmo.dev
//   node scripts/deploy-docs.ts --preview  # preview branch -> rc-preview.*.pages.dev
//
// Requires an authenticated wrangler (wrangler login) or CLOUDFLARE_API_TOKEN.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = 'upmo-design-system';
const preview = process.argv.includes('--preview');
const branch = preview ? 'rc-preview' : 'main';

function run(cmd: string, args: string[]) {
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
}

console.log(`> building combined site (docs + storybook)`);
run('pnpm', ['--filter', '@upmo-ai/docs', 'build:site']);

console.log(`> deploying to Cloudflare Pages project "${PROJECT}" branch "${branch}"`);
run('npx', [
  'wrangler',
  'pages',
  'deploy',
  'apps/docs/dist',
  `--project-name=${PROJECT}`,
  `--branch=${branch}`,
  '--commit-dirty=true',
]);

console.log(
  preview
    ? `\nPreview deployed: https://rc-preview.${PROJECT}.pages.dev`
    : `\nProduction deployed: https://design.upmo.dev`,
);
