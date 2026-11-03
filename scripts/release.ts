#!/usr/bin/env node
// Lockstep release steps for the five @upmo-ai packages, called by the
// release workflow (.github/workflows/release.yml). Publishing happens only in
// that workflow; this script never publishes.
//
// version.json is the single source of truth. The next version is computed
// from it, and the changelog from the conventional commits since the previous
// tag: the latest v* tag for a prerelease, the latest stable tag for a stable
// release (so a stable release lists everything its release candidates had).
//
// Usage:
//   node scripts/release.ts plan  --bump <bump> [--preid rc]
//   node scripts/release.ts apply --bump <bump> [--preid rc] [--dry-run]
//   node scripts/release.ts gate
//   node scripts/release.ts commit-payload --repo <owner/name> --branch <name> --head <sha>
//
//   bump:  major | minor | patch | premajor | preminor | prepatch | prerelease
//          (prerelease bumps the -rc.N counter; premajor etc. start a new -rc.0)
//
//   plan            prints the release plan as JSON: version, tag, dist-tag
//                   (prerelease -> next, stable -> latest), changelog markdown
//                   and the files apply writes. Fails when there is nothing to
//                   release. When HEAD is already the release commit for the
//                   current version and its tag is missing (a run that failed
//                   after committing), it plans that version with resume: true
//                   and the workflow only creates the tag.
//   apply           writes the version into version.json and every package,
//                   syncs the lockfile and prepends the CHANGELOG.md section.
//                   --dry-run prints what it would write and changes nothing.
//   gate            build, lint, test and a pack dry-run of every package.
//   commit-payload  prints the GraphQL createCommitOnBranch request that
//                   commits the files apply wrote, so GitHub signs the commit.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prependChangelog } from './changelog.ts';
import { planRelease, releaseHeadline } from './plan.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Publish order: dependencies before dependents.
const PACKAGES = ['tokens', 'icons', 'brands', 'theme', 'components'] as const;
const PKG_NAMES = PACKAGES.map((p) => `@upmo-ai/${p}`);
const FILES = [
  'version.json',
  'CHANGELOG.md',
  'pnpm-lock.yaml',
  ...PACKAGES.map((p) => `packages/${p}/package.json`),
];

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv;
  const opts: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith('--')) throw new Error(`Unexpected argument: ${a}`);
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) opts[k] = v;
    else if (rest[i + 1] && !rest[i + 1].startsWith('--')) opts[k] = rest[++i];
    else opts[k] = true;
  }
  return { command, opts };
}

function option(opts: Record<string, string | boolean>, name: string): string {
  const v = opts[name];
  if (typeof v !== 'string' || v === '') throw new Error(`Missing --${name}`);
  return v;
}

function run(cmd: string, args: string[]) {
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

function writeJson(path: string, data: unknown) {
  writeFileSync(resolve(root, path), JSON.stringify(data, null, 2) + '\n');
}

function plan(opts: Record<string, string | boolean>) {
  const p = planRelease({
    git,
    current: readJson('version.json').version as string,
    bump: option(opts, 'bump'),
    preid: typeof opts.preid === 'string' ? opts.preid : 'rc',
  });
  return {
    ...p,
    date: new Date().toISOString().slice(0, 10),
    packages: PKG_NAMES,
    files: FILES,
  };
}

function apply(opts: Record<string, string | boolean>) {
  const p = plan(opts);
  if (p.resume) {
    throw new Error(`HEAD is already the release commit for ${p.version}; only its tag is missing, nothing to apply.`);
  }
  if (opts['dry-run']) {
    console.log(`Dry run: would release ${p.current} -> ${p.version} (dist-tag ${p.distTag}) and write:`);
    for (const f of p.files) console.log(`  ${f}`);
    console.log(`\n## ${p.version} (${p.date})\n\n${p.changelog}`);
    return;
  }

  writeJson('version.json', { version: p.version });
  for (const pkgDir of PACKAGES) {
    const path = `packages/${pkgDir}/package.json`;
    const pkg = readJson(path);
    pkg.version = p.version;
    // Pin internal cross-refs to the exact version in every dependency block.
    for (const block of ['dependencies', 'peerDependencies', 'devDependencies'] as const) {
      const deps = pkg[block];
      if (!deps) continue;
      for (const name of Object.keys(deps)) {
        if (PKG_NAMES.includes(name)) deps[name] = `workspace:${p.version}`;
      }
    }
    writeJson(path, pkg);
  }
  // Keep the lockfile in sync with the rewritten workspace specifiers.
  run('pnpm', ['install', '--lockfile-only']);

  const changelogPath = resolve(root, 'CHANGELOG.md');
  writeFileSync(changelogPath, prependChangelog(readFileSync(changelogPath, 'utf8'), p.version, p.date, p.changelog));
  console.log(`Wrote ${p.version} to ${p.files.join(', ')}`);
}

function gate() {
  run('pnpm', ['-r', 'build']);
  run('pnpm', ['run', 'lint']);
  run('pnpm', ['run', 'test']);
  for (const name of PKG_NAMES) run('pnpm', ['--filter', name, 'pack', '--dry-run']);
}

function commitPayload(opts: Record<string, string | boolean>) {
  const version = readJson('version.json').version as string;
  const query =
    'mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid url } } }';
  const input = {
    branch: { repositoryNameWithOwner: option(opts, 'repo'), branchName: option(opts, 'branch') },
    expectedHeadOid: option(opts, 'head'),
    message: { headline: releaseHeadline(version) },
    fileChanges: {
      additions: FILES.map((path) => ({
        path,
        contents: readFileSync(resolve(root, path)).toString('base64'),
      })),
    },
  };
  return { query, variables: { input } };
}

try {
  const { command, opts } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'plan':
      console.log(JSON.stringify(plan(opts), null, 2));
      break;
    case 'apply':
      apply(opts);
      break;
    case 'gate':
      gate();
      break;
    case 'commit-payload':
      console.log(JSON.stringify(commitPayload(opts)));
      break;
    default:
      throw new Error('Usage: node scripts/release.ts <plan|apply|gate|commit-payload> [options]');
  }
} catch (err) {
  console.error(`release: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
