import { describe, expect, it } from 'vitest';
import { findRetiredWords, isTextFile } from './terms.ts';

describe('findRetiredWords', () => {
  it('finds retired words in any case, with their line', () => {
    const text = 'Start a task.\nMissions list and the Inbox.\nOne sub-mission, two HARNESSES.';
    expect(findRetiredWords(text)).toEqual([
      { line: 2, match: 'Missions' },
      { line: 2, match: 'Inbox' },
      { line: 3, match: 'sub-mission' },
      { line: 3, match: 'HARNESSES' },
    ]);
  });

  it('matches whole words only', () => {
    expect(findRetiredWords('emission, inboxes, analyticsd, conversational')).toEqual([]);
    expect(findRetiredWords('the working-mission lift')).toEqual([{ line: 1, match: 'mission' }]);
    expect(findRetiredWords('nav.analytics')).toEqual([{ line: 1, match: 'analytics' }]);
  });

  it('finds destination in both forms', () => {
    expect(findRetiredWords('Pick a destination.\nTwo Destinations.')).toEqual([
      { line: 1, match: 'destination' },
      { line: 2, match: 'Destinations' },
    ]);
  });
});

describe('isTextFile', () => {
  it('accepts the scanned text types and skips the rest', () => {
    expect(['a.md', 'b.mdx', 'c.json', 'd.html', 'e.css'].every(isTextFile)).toBe(true);
    expect(isTextFile('logo.svg')).toBe(false);
    expect(isTextFile('shot.png')).toBe(false);
  });
});
