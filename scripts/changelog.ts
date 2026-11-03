// Builds a release's changelog section from conventional commit subjects.

export const COMMIT_URL = 'https://github.com/upmo-ai/design-system/commit/';

export type Commit = { sha: string; subject: string; body: string };

export type Entry = { sha: string; scope?: string; subject: string; breaking: boolean };

const GROUPS = [
  ['breaking', 'Breaking changes'],
  ['feat', 'Features'],
  ['fix', 'Fixes'],
  ['perf', 'Performance'],
  ['other', 'Other changes'],
] as const;

type Group = (typeof GROUPS)[number][0];

const conventional = /^(\w+)(?:\(([^)]+)\))?(!)?: ?(.+)$/;
const breakingFooter = /^BREAKING[ -]CHANGE: /m;
// git's default revert subject: Revert "<original subject>"
const revert = /^Revert "(.+)"$/;

// Sorts a commit into its changelog group, or returns null for commits that
// never appear (release commits and merge commits). A revert is listed under
// other changes as "Revert: <original subject>".
export function classify(commit: Commit): { group: Group; entry: Entry } | null {
  if (/^Merge /.test(commit.subject)) return null;
  const reverted = commit.subject.match(revert);
  if (reverted) {
    return { group: 'other', entry: { sha: commit.sha, subject: `Revert: ${reverted[1]}`, breaking: false } };
  }
  const m = commit.subject.match(conventional);
  if (!m) {
    return { group: 'other', entry: { sha: commit.sha, subject: commit.subject, breaking: false } };
  }
  const [, type, scope, bang, subject] = m;
  if (type === 'release') return null;
  const breaking = Boolean(bang) || breakingFooter.test(commit.body);
  const entry: Entry = { sha: commit.sha, scope, subject, breaking };
  if (breaking) return { group: 'breaking', entry };
  if (type === 'feat' || type === 'fix' || type === 'perf') return { group: type, entry };
  return { group: 'other', entry };
}

function line(entry: Entry): string {
  const scope = entry.scope ? `**${entry.scope}:** ` : '';
  return `- ${scope}${entry.subject} ([${entry.sha.slice(0, 7)}](${COMMIT_URL}${entry.sha}))`;
}

// Markdown for one release, used verbatim as the GitHub Release notes. Returns
// an empty string when no commit belongs in a changelog. A commit and its
// revert in the same release cancel out, so neither is listed.
export function renderChangelog(commits: Commit[]): string {
  const subjects = new Set(commits.map((c) => c.subject));
  const cancelled = new Set<string>();
  for (const c of commits) {
    const original = c.subject.match(revert)?.[1];
    if (original && subjects.has(original)) cancelled.add(c.subject).add(original);
  }
  const grouped = new Map<Group, Entry[]>();
  for (const commit of commits) {
    if (cancelled.has(commit.subject)) continue;
    const c = classify(commit);
    if (!c) continue;
    grouped.set(c.group, [...(grouped.get(c.group) ?? []), c.entry]);
  }
  return GROUPS.filter(([key]) => grouped.has(key))
    .map(([key, title]) => [`### ${title}`, '', ...grouped.get(key)!.map(line)].join('\n'))
    .join('\n\n');
}

// Inserts a `## version (date)` section above the newest entry in CHANGELOG.md.
export function prependChangelog(existing: string, version: string, date: string, notes: string): string {
  const section = `## ${version} (${date})\n\n${notes}\n`;
  const at = existing.search(/^## /m);
  if (at === -1) return `${existing.trimEnd()}\n\n${section}`;
  return `${existing.slice(0, at)}${section}\n${existing.slice(at)}`;
}
