#!/usr/bin/env node
// Automated, lockstep release for the five @upmo-ai packages.
//
// version.json is the single source of truth. This script computes the next
// version from it, runs the quality gate (build, lint, test, pack dry-run),
// writes the new version into every package.json and into version.json, makes
// one signed commit, then publishes all five in dependency order with the
// right dist-tag (prerelease -> next, stable -> latest, and a stable release
// moves latest onto itself).
//
// Usage:
//   node scripts/release.ts <bump> [options]
//
//   bump:  major | minor | patch | premajor | preminor | prepatch | prerelease
//          (prerelease bumps the -rc.N counter; premajor etc. start a new -rc.0)
//   --preid=<id>     prerelease identifier (default: rc)
//   --date=<iso>     author+committer date for the release commit (backdating)
//   --tag=<tag>      override the npm dist-tag (default: auto from version)
//   --dry-run        do everything except commit and publish (prints the plan)
//   --no-gate        skip build/lint/test (NOT recommended; for debugging)
//
// Examples:
//   node scripts/release.ts major --date=2026-08-13T10:30:00+02:00
//   node scripts/release.ts prerelease                 # 1.0.0-rc.1 -> 1.0.0-rc.2
//   node scripts/release.ts minor --dry-run
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Publish order: dependencies before dependents.
const PACKAGES = ['tokens', 'icons', 'brands', 'theme', 'components'] as const;
const PKG_NAMES = PACKAGES.map((p) => `@upmo-ai/${p}`);

type Args = {
  bump: string;
  preid: string;
  date?: string;
  tag?: string;
  dryRun: boolean;
  gate: boolean;
};

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const opts: Record<string, string | boolean> = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      opts[k] = v ?? true;
    } else {
      positional.push(a);
    }
  }
  const bump = positional[0];
  const valid = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
  if (!bump || !valid.includes(bump)) {
    throw new Error(`First argument must be one of: ${valid.join(', ')}`);
  }
  return {
    bump,
    preid: (opts.preid as string) || 'rc',
    date: opts.date as string | undefined,
    tag: opts.tag as string | undefined,
    dryRun: Boolean(opts['dry-run']),
    gate: opts['no-gate'] ? false : true,
  };
}

// Minimal semver bumper covering the release/prerelease cases we use.
function bumpVersion(current: string, bump: string, preid: string): string {
  const m = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!m) throw new Error(`Cannot parse version: ${current}`);
  let [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const pre = m[4];

  const startPre = (M: number, mi: number, p: number) => `${M}.${mi}.${p}-${preid}.0`;

  switch (bump) {
    case 'major':
      // If we are on a prerelease of this major (x.0.0-rc.N), graduate to x.0.0.
      if (pre && minor === 0 && patch === 0) return `${major}.0.0`;
      return `${major + 1}.0.0`;
    case 'minor':
      if (pre && patch === 0) return `${major}.${minor}.0`;
      return `${major}.${minor + 1}.0`;
    case 'patch':
      if (pre) return `${major}.${minor}.${patch}`;
      return `${major}.${minor}.${patch + 1}`;
    case 'premajor':
      return startPre(major + 1, 0, 0);
    case 'preminor':
      return startPre(major, minor + 1, 0);
    case 'prepatch':
      return startPre(major, minor, patch + 1);
    case 'prerelease': {
      if (!pre) return startPre(major, minor, patch + 1);
      const parts = pre.split('.');
      const n = Number(parts[parts.length - 1]);
      if (Number.isNaN(n)) return `${major}.${minor}.${patch}-${pre}.0`;
      parts[parts.length - 1] = String(n + 1);
      return `${major}.${minor}.${patch}-${parts.join('.')}`;
    }
    default:
      throw new Error(`Unhandled bump: ${bump}`);
  }
}

function isPrerelease(v: string): boolean {
  return v.includes('-');
}

function run(cmd: string, args: string[], extraEnv: Record<string, string> = {}) {
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...extraEnv } });
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const versionFile = resolve(root, 'version.json');
  const current = readJson(versionFile).version as string;
  const next = bumpVersion(current, args.bump, args.preid);
  const tag = args.tag ?? (isPrerelease(next) ? 'next' : 'latest');

  console.log(`\nRelease plan`);
  console.log(`  current : ${current}`);
  console.log(`  next    : ${next}`);
  console.log(`  dist-tag: ${tag}`);
  console.log(`  packages: ${PKG_NAMES.join(', ')}`);
  console.log(`  date    : ${args.date ?? '(now)'}`);
  console.log(`  dry-run : ${args.dryRun}\n`);

  // 1. Quality gate.
  if (args.gate) {
    console.log('> gate: build');
    run('pnpm', ['-r', 'build']);
    console.log('> gate: lint');
    run('pnpm', ['run', 'lint']);
    console.log('> gate: test');
    run('pnpm', ['run', 'test']);
  } else {
    console.log('> gate skipped (--no-gate)');
  }

  // 2. Write the new version everywhere.
  writeJson(versionFile, { version: next });
  for (const p of PACKAGES) {
    const pkgPath = resolve(root, 'packages', p, 'package.json');
    const pkg = readJson(pkgPath);
    pkg.version = next;
    // Pin internal cross-refs to the exact version in every dependency block.
    for (const block of ['dependencies', 'peerDependencies', 'devDependencies'] as const) {
      const deps = pkg[block];
      if (!deps) continue;
      for (const name of Object.keys(deps)) {
        if (PKG_NAMES.includes(name)) deps[name] = `workspace:${next}`;
      }
    }
    writeJson(pkgPath, pkg);
  }
  console.log(`> wrote version ${next} to version.json and ${PACKAGES.length} packages`);

  // Keep the lockfile in sync with the rewritten workspace specifiers.
  run('pnpm', ['install', '--lockfile-only']);

  // 3. Pack dry-run sanity check.
  if (args.gate) {
    for (const p of PACKAGES) {
      console.log(`> pack check: @upmo-ai/${p}`);
      run('pnpm', ['--filter', `@upmo-ai/${p}`, 'publish', '--tag', tag, '--no-git-checks', '--dry-run']);
    }
  }

  if (args.dryRun) {
    // Restore the files we touched so a dry run leaves the tree unchanged.
    // version.json may be untracked, so rewrite it explicitly; the package
    // manifests and lockfile are tracked, so restore them from git.
    writeJson(versionFile, { version: current });
    const tracked = [
      'pnpm-lock.yaml',
      ...PACKAGES.map((p) => `packages/${p}/package.json`),
    ];
    for (const f of tracked) {
      try {
        run('git', ['checkout', '--', f]);
      } catch {
        /* ignore: file may be untracked in a fresh checkout */
      }
    }
    console.log('> dry run: reverted version edits');
    console.log('\nDry run complete. No commit, no publish.');
    return;
  }

  // 4. Signed commit.
  const files = [
    'version.json',
    'pnpm-lock.yaml',
    ...PACKAGES.map((p) => `packages/${p}/package.json`),
  ];
  run('git', ['add', ...files]);
  const dateEnv: Record<string, string> = args.date
    ? { GIT_AUTHOR_DATE: args.date, GIT_COMMITTER_DATE: args.date }
    : {};
  run('git', ['commit', '-S', '-m', `release: version packages at ${next}`], dateEnv);
  console.log(`> committed release ${next}${args.date ? ` dated ${args.date}` : ''}`);

  // 5. Publish in dependency order.
  for (const p of PACKAGES) {
    console.log(`> publish @upmo-ai/${p}@${next} (tag: ${tag})`);
    run('pnpm', ['--filter', `@upmo-ai/${p}`, 'publish', '--tag', tag, '--no-git-checks']);
  }

  // 6. For a stable release, make sure latest points at it.
  if (!isPrerelease(next)) {
    for (const name of PKG_NAMES) {
      console.log(`> dist-tag add ${name}@${next} latest`);
      run('npm', ['dist-tag', 'add', `${name}@${next}`, 'latest']);
    }
  }

  console.log(`\nReleased ${next} (dist-tag: ${tag}). Run "pnpm deploy:docs" to publish the docs.`);
}

main();
