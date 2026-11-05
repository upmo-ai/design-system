// Lockstep version maths for the six @upmo-ai packages.

export const BUMPS = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'] as const;
export type Bump = (typeof BUMPS)[number];

export function isBump(value: string): value is Bump {
  return (BUMPS as readonly string[]).includes(value);
}

// Minimal semver bumper covering the release/prerelease cases we use.
export function bumpVersion(current: string, bump: Bump, preid: string): string {
  const m = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!m) throw new Error(`Cannot parse version: ${current}`);
  const [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
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
  }
}

export function isPrerelease(version: string): boolean {
  return version.includes('-');
}

// Prereleases go to `next` so `npm install` keeps resolving the last stable;
// a stable release goes to `latest`.
export function distTag(version: string): 'next' | 'latest' {
  return isPrerelease(version) ? 'next' : 'latest';
}
