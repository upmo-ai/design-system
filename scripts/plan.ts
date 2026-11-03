// Release planning: the next version, the tag range and the changelog. Git is
// injected so the range logic can be tested without a repository.
import { renderChangelog, type Commit } from './changelog.ts';
import { bumpVersion, distTag, isBump, isPrerelease, BUMPS } from './version.ts';

// Runs git with the given arguments and returns trimmed stdout; throws when
// git exits non-zero.
export type Git = (args: string[]) => string;

export function releaseHeadline(version: string): string {
  return `release: version packages at ${version}`;
}

export function tagExists(git: Git, tag: string): boolean {
  return git(['tag', '--list', tag]) !== '';
}

// The latest v* tag reachable from HEAD; for a stable release the latest
// stable tag, so its changelog covers every release candidate before it.
export function previousTag(git: Git, stable: boolean): string | undefined {
  const args = ['describe', '--tags', '--abbrev=0', '--match', 'v*'];
  if (stable) args.push('--exclude', 'v*-*');
  try {
    return git(args);
  } catch {
    return undefined;
  }
}

export function commitsSince(git: Git, tag: string | undefined): Commit[] {
  const log = git(['log', '--no-merges', '--format=%H%x1f%s%x1f%b%x1e', tag ? `${tag}..HEAD` : 'HEAD']);
  return log
    .split('\x1e')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [sha, subject, body = ''] = r.split('\x1f');
      return { sha, subject, body };
    });
}

// True when HEAD is the release commit for `current` and its tag is missing:
// a release whose commit landed but whose tag step failed. Planning then
// resumes that release instead of bumping again.
export function isUntaggedRelease(git: Git, current: string): boolean {
  return git(['log', '-1', '--format=%s', 'HEAD']) === releaseHeadline(current) && !tagExists(git, `v${current}`);
}

export type PlanInput = { git: Git; current: string; bump: string; preid: string };

export function planRelease({ git, current, bump, preid }: PlanInput) {
  if (!isBump(bump)) throw new Error(`--bump must be one of: ${BUMPS.join(', ')}`);
  if (!/^[0-9a-z-]+$/.test(preid)) {
    throw new Error(`Invalid --preid "${preid}": use lowercase letters, digits and hyphens (npm rejects uppercase).`);
  }

  const resume = isUntaggedRelease(git, current);
  const version = resume ? current : bumpVersion(current, bump, preid);
  const tag = `v${version}`;
  if (!resume && tagExists(git, tag)) throw new Error(`Tag ${tag} already exists; ${version} is already released.`);

  const since = previousTag(git, !isPrerelease(version));
  const changelog = renderChangelog(commitsSince(git, since));
  if (!changelog) {
    throw new Error(`Nothing to release: no changelog-worthy commits since ${since ?? 'the first commit'}.`);
  }
  return {
    current,
    version,
    tag,
    distTag: distTag(version),
    prerelease: isPrerelease(version),
    resume,
    since: since ?? null,
    changelog,
  };
}
