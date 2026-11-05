import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COMMIT_URL, classify, prependChangelog, renderChangelog, type Commit } from '../changelog.ts';
import { PACKAGES, PKG_NAMES } from '../packages.ts';
import { planRelease, previousTag, type Git } from '../plan.ts';
import { bumpVersion, distTag, isBump } from '../version.ts';

describe('bumpVersion', () => {
  it.each([
    ['1.0.0', 'patch', '1.0.1'],
    ['1.0.0', 'minor', '1.1.0'],
    ['1.0.0', 'major', '2.0.0'],
    ['1.0.0', 'prepatch', '1.0.1-rc.0'],
    ['1.0.0', 'preminor', '1.1.0-rc.0'],
    ['1.0.0', 'premajor', '2.0.0-rc.0'],
    ['1.0.0', 'prerelease', '1.0.1-rc.0'],
    ['1.1.0-rc.0', 'prerelease', '1.1.0-rc.1'],
    ['1.1.0-rc.1', 'minor', '1.1.0'],
    ['2.0.0-rc.3', 'major', '2.0.0'],
    ['1.0.1-rc.0', 'patch', '1.0.1'],
    ['1.1.0-rc.1', 'patch', '1.1.0'],
    ['1.1.1-rc.0', 'minor', '1.2.0'],
    ['1.1.0-beta', 'prerelease', '1.1.0-beta.0'],
  ] as const)('%s + %s -> %s', (current, bump, next) => {
    expect(bumpVersion(current, bump, 'rc')).toBe(next);
  });

  it('uses the preid for a new prerelease', () => {
    expect(bumpVersion('1.0.0', 'preminor', 'beta')).toBe('1.1.0-beta.0');
  });

  it('rejects an unparseable version', () => {
    expect(() => bumpVersion('one', 'patch', 'rc')).toThrow(/Cannot parse/);
  });

  it('accepts only known bumps', () => {
    expect(isBump('minor')).toBe(true);
    expect(isBump('mayor')).toBe(false);
  });
});

describe('distTag', () => {
  it('sends prereleases to next and stable releases to latest', () => {
    expect(distTag('1.1.0-rc.0')).toBe('next');
    expect(distTag('1.1.0')).toBe('latest');
  });
});

const sha = (n: number) => String(n).repeat(40).slice(0, 40);
const commit = (n: number, subject: string, body = ''): Commit => ({ sha: sha(n), subject, body });

describe('classify', () => {
  it('parses type, scope and subject', () => {
    expect(classify(commit(1, 'feat(tokens): add a spacing scale'))).toEqual({
      group: 'feat',
      entry: { sha: sha(1), scope: 'tokens', subject: 'add a spacing scale', breaking: false },
    });
  });

  it('treats a bang as breaking', () => {
    expect(classify(commit(1, 'refactor(theme)!: rename the resolver'))?.group).toBe('breaking');
    expect(classify(commit(1, 'feat!: drop node 22'))?.group).toBe('breaking');
  });

  it('treats a BREAKING CHANGE footer as breaking', () => {
    const c = commit(1, 'fix(components): tighten Button props', 'Body.\n\nBREAKING CHANGE: size is required');
    expect(classify(c)?.group).toBe('breaking');
  });

  it('puts non-conventional subjects under other changes', () => {
    expect(classify(commit(1, 'Add the form controls'))).toEqual({
      group: 'other',
      entry: { sha: sha(1), subject: 'Add the form controls', breaking: false },
    });
  });

  it('skips release and merge commits', () => {
    expect(classify(commit(1, 'release: version packages at 1.0.0'))).toBeNull();
    expect(classify(commit(1, "Merge branch 'feat/x'"))).toBeNull();
  });

  it('accepts a subject with no space after the colon', () => {
    expect(classify(commit(1, 'feat(icons):add a caret'))?.entry).toMatchObject({ scope: 'icons', subject: 'add a caret' });
  });

  it('lists a revert under other changes', () => {
    expect(classify(commit(1, 'Revert "feat(components): add Stepper"'))).toEqual({
      group: 'other',
      entry: { sha: sha(1), subject: 'Revert: feat(components): add Stepper', breaking: false },
    });
  });
});

describe('renderChangelog', () => {
  it('groups entries in a fixed order and links each commit', () => {
    const md = renderChangelog([
      commit(1, 'docs: explain theming'),
      commit(2, 'fix(tokens): close a contrast gap'),
      commit(3, 'feat(components): add Stepper'),
      commit(4, 'perf(icons): lazy-load the map'),
      commit(5, 'feat(theme)!: drop the legacy resolver'),
      commit(6, 'release: version packages at 1.0.0'),
      commit(7, 'Tidy the docs header'),
    ]);
    expect(md).toBe(
      [
        '### Breaking changes',
        '',
        `- **theme:** drop the legacy resolver ([5555555](${COMMIT_URL}${sha(5)}))`,
        '',
        '### Features',
        '',
        `- **components:** add Stepper ([3333333](${COMMIT_URL}${sha(3)}))`,
        '',
        '### Fixes',
        '',
        `- **tokens:** close a contrast gap ([2222222](${COMMIT_URL}${sha(2)}))`,
        '',
        '### Performance',
        '',
        `- **icons:** lazy-load the map ([4444444](${COMMIT_URL}${sha(4)}))`,
        '',
        '### Other changes',
        '',
        `- explain theming ([1111111](${COMMIT_URL}${sha(1)}))`,
        `- Tidy the docs header ([7777777](${COMMIT_URL}${sha(7)}))`,
      ].join('\n'),
    );
  });

  it('is empty when only release commits remain', () => {
    expect(renderChangelog([commit(1, 'release: version packages at 1.0.0')])).toBe('');
    expect(renderChangelog([])).toBe('');
  });

  it('drops a commit and its revert when both are in the release', () => {
    const md = renderChangelog([
      commit(1, 'fix(tokens): close a contrast gap'),
      commit(2, 'feat(components): add Stepper'),
      commit(3, 'Revert "feat(components): add Stepper"'),
    ]);
    expect(md).toBe(`### Fixes\n\n- **tokens:** close a contrast gap ([1111111](${COMMIT_URL}${sha(1)}))`);
  });

  it('keeps a revert whose original shipped in an earlier release', () => {
    expect(renderChangelog([commit(3, 'Revert "feat(components): add Stepper"')])).toBe(
      `### Other changes\n\n- Revert: feat(components): add Stepper ([3333333](${COMMIT_URL}${sha(3)}))`,
    );
  });
});

// A fake repository: tags in the order they were made (newest last, all
// reachable from HEAD), the commits after each tag, and HEAD's subject.
function fakeGit(repo: { tags: string[]; log: Record<string, string[]>; head: string }): Git {
  return (args) => {
    const key = args.join(' ');
    if (key.startsWith('describe ')) {
      const stable = args.includes('--exclude');
      const tag = [...repo.tags].reverse().find((t) => !stable || !t.includes('-'));
      if (!tag) throw new Error('fatal: No names found');
      return tag;
    }
    if (args[0] === 'tag') return repo.tags.includes(args[2]) ? args[2] : '';
    if (key === 'log -1 --format=%s HEAD') return repo.head;
    if (args[0] === 'log') {
      const range = args[args.length - 1];
      const subjects = repo.log[range];
      if (!subjects) throw new Error(`unexpected range ${range}`);
      return subjects.map((s, i) => `${sha(i + 1)}\x1f${s}\x1f\x1e`).join('\n');
    }
    throw new Error(`unexpected git ${key}`);
  };
}

describe('previousTag', () => {
  const git = fakeGit({ tags: ['v1.0.0', 'v1.1.0-rc.0'], log: {}, head: '' });

  it('finds the latest tag for a prerelease and the latest stable tag for a stable release', () => {
    expect(previousTag(git, false)).toBe('v1.1.0-rc.0');
    expect(previousTag(git, true)).toBe('v1.0.0');
  });

  it('is undefined when there are no tags', () => {
    expect(previousTag(fakeGit({ tags: [], log: {}, head: '' }), true)).toBeUndefined();
  });
});

describe('planRelease', () => {
  const afterRc = {
    tags: ['v1.0.0', 'v1.1.0-rc.0'],
    log: {
      'v1.0.0..HEAD': ['feat(components): add Stepper', 'release: version packages at 1.1.0-rc.0', 'fix: keep focus'],
      'v1.1.0-rc.0..HEAD': ['fix: keep focus'],
    },
    head: 'fix: keep focus',
  };

  it('lists everything since the last stable tag when an rc graduates', () => {
    const p = planRelease({ git: fakeGit(afterRc), current: '1.1.0-rc.0', bump: 'minor', preid: 'rc' });
    expect(p).toMatchObject({ version: '1.1.0', tag: 'v1.1.0', distTag: 'latest', prerelease: false, resume: false, since: 'v1.0.0' });
    expect(p.changelog).toContain('add Stepper');
    expect(p.changelog).toContain('keep focus');
  });

  it('lists only what is new since the previous rc for the next rc', () => {
    const p = planRelease({ git: fakeGit(afterRc), current: '1.1.0-rc.0', bump: 'prerelease', preid: 'rc' });
    expect(p).toMatchObject({ version: '1.1.0-rc.1', distTag: 'next', prerelease: true, since: 'v1.1.0-rc.0' });
    expect(p.changelog).not.toContain('add Stepper');
  });

  it('uses the whole history when there are no tags', () => {
    const git = fakeGit({ tags: [], log: { HEAD: ['feat: first'] }, head: 'feat: first' });
    expect(planRelease({ git, current: '0.1.0', bump: 'minor', preid: 'rc' })).toMatchObject({ version: '0.2.0', since: null });
  });

  it('refuses a version whose tag already exists', () => {
    const git = fakeGit({ ...afterRc, tags: ['v1.0.0', 'v1.1.0-rc.0', 'v1.1.0'] });
    expect(() => planRelease({ git, current: '1.1.0-rc.0', bump: 'minor', preid: 'rc' })).toThrow(/Tag v1.1.0 already exists/);
  });

  it('refuses an empty release', () => {
    const git = fakeGit({ tags: ['v1.0.0'], log: { 'v1.0.0..HEAD': ['release: version packages at 1.0.0'] }, head: 'x' });
    expect(() => planRelease({ git, current: '1.0.0', bump: 'patch', preid: 'rc' })).toThrow(/Nothing to release.*since v1.0.0/);
  });

  it('rejects an uppercase or empty preid and an unknown bump', () => {
    const git = fakeGit(afterRc);
    expect(() => planRelease({ git, current: '1.0.0', bump: 'preminor', preid: 'RC' })).toThrow(/Invalid --preid "RC"/);
    expect(() => planRelease({ git, current: '1.0.0', bump: 'preminor', preid: '' })).toThrow(/Invalid --preid/);
    expect(() => planRelease({ git, current: '1.0.0', bump: 'mayor', preid: 'rc' })).toThrow(/--bump must be one of/);
  });

  it('resumes an untagged release commit instead of bumping again', () => {
    const git = fakeGit({
      tags: ['v1.0.0'],
      log: { 'v1.0.0..HEAD': ['feat: add Stepper', 'release: version packages at 1.1.0'] },
      head: 'release: version packages at 1.1.0',
    });
    expect(planRelease({ git, current: '1.1.0', bump: 'minor', preid: 'rc' })).toMatchObject({
      version: '1.1.0',
      tag: 'v1.1.0',
      resume: true,
      since: 'v1.0.0',
    });
  });

  it('does not resume a release commit that is already tagged', () => {
    const git = fakeGit({
      tags: ['v1.0.0', 'v1.1.0'],
      log: { 'v1.1.0..HEAD': [] },
      head: 'release: version packages at 1.1.0',
    });
    expect(() => planRelease({ git, current: '1.1.0', bump: 'patch', preid: 'rc' })).toThrow(/Nothing to release.*since v1.1.0/);
  });
});

describe('prependChangelog', () => {
  const existing = '# Changelog\n\nIntro.\n\n## 1.0.0 (2026-08-13)\n\nFirst.\n';

  it('puts the new section above the newest entry', () => {
    expect(prependChangelog(existing, '1.1.0', '2026-11-03', '### Fixes\n\n- x')).toBe(
      '# Changelog\n\nIntro.\n\n## 1.1.0 (2026-11-03)\n\n### Fixes\n\n- x\n\n## 1.0.0 (2026-08-13)\n\nFirst.\n',
    );
  });

  it('appends after the intro when there is no entry yet', () => {
    expect(prependChangelog('# Changelog\n', '1.0.0', '2026-08-13', 'First.')).toBe(
      '# Changelog\n\n## 1.0.0 (2026-08-13)\n\nFirst.\n',
    );
  });
});

const repo = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const readJson = (path: string) => JSON.parse(readFileSync(join(repo, path), 'utf8'));

describe('lockstep package list', () => {
  const published = readdirSync(join(repo, 'packages'))
    .filter((dir) => !readJson(`packages/${dir}/package.json`).private)
    .sort();

  it('names every publishable package in the workspace', () => {
    expect([...PACKAGES].sort()).toEqual(published);
    expect(PKG_NAMES).toEqual(PACKAGES.map((p) => readJson(`packages/${p}/package.json`).name));
  });

  it('publishes exactly those packages, in the same order, from the release workflow', () => {
    const workflow = readFileSync(join(repo, '.github/workflows/release.yml'), 'utf8');
    const loop = workflow.match(/for pkg in ([a-z ]+); do/);
    expect(loop, 'the publish loop in release.yml').not.toBeNull();
    expect(loop![1].trim().split(/\s+/)).toEqual([...PACKAGES]);
  });

  it('keeps every package at the lockstep version', () => {
    const { version } = readJson('version.json');
    for (const pkg of PACKAGES) expect(readJson(`packages/${pkg}/package.json`).version, pkg).toBe(version);
  });

  it('says how many packages release together', () => {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const count = `the ${words[PACKAGES.length]} @upmo-ai packages`;
    const workflow = readFileSync(join(repo, '.github/workflows/release.yml'), 'utf8');
    expect(workflow.replace(/\s+#\s*/g, ' ')).toContain(count);
    expect(readFileSync(join(repo, 'CHANGELOG.md'), 'utf8')).toContain(count);
  });
});
