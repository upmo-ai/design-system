import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findHexColours, listFiles } from './hex.ts';

describe('findHexColours', () => {
  it('finds 3, 4, 6 and 8 digit colours with their line', () => {
    const text = 'a { color: #fff; }\nb { background: #1f8a5b; border-color: #141a177a; }\nc { fill: #abcd; }';
    expect(findHexColours(text)).toEqual([
      { line: 1, match: '#fff' },
      { line: 2, match: '#1f8a5b' },
      { line: 2, match: '#141a177a' },
      { line: 3, match: '#abcd' },
    ]);
  });

  it('ignores anchors, entities and lengths that are not colours', () => {
    expect(findHexColours('<a href="#accessibility">x</a> &#123; #12345 #abcdefg var(--emerald)')).toEqual([]);
  });
});

describe('listFiles', () => {
  it('walks a tree and skips the listed paths', () => {
    const root = mkdtempSync(join(tmpdir(), 'hex-'));
    mkdirSync(join(root, 'keep'));
    mkdirSync(join(root, 'skip'));
    writeFileSync(join(root, 'keep', 'a.css'), '');
    writeFileSync(join(root, 'skip', 'b.css'), '');
    expect(listFiles(root, [join(root, 'skip')])).toEqual([join(root, 'keep', 'a.css')]);
  });
});
