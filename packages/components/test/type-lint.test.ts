import { describe, expect, it } from 'vitest';
import { findRawFontSizes } from '../../../scripts/type.ts';

describe('findRawFontSizes', () => {
  it('flags raw px and rem font sizes with their line', () => {
    expect(findRawFontSizes('a {\n  font-size: 13px;\n}\nb { font-size: 0.875rem; }')).toEqual([
      { line: 2, match: 'font-size: 13px' },
      { line: 4, match: 'font-size: 0.875rem' },
    ]);
  });

  it('allows token variables, including nested ones', () => {
    expect(findRawFontSizes('font-size: var(--text-body-sm-size);')).toEqual([]);
    expect(findRawFontSizes('font-size: var(--a, var(--text-caption-size));')).toEqual([]);
  });

  it('flags a raw length beside or inside calc with a var', () => {
    expect(findRawFontSizes('font-size: calc(var(--text-body-size) + 2px);')).toHaveLength(1);
  });

  it('allows keywords and relative units', () => {
    expect(findRawFontSizes('font-size: inherit; font-size: 1em; font-size: 90%;')).toEqual([]);
  });

  it('skips a line that marks the size as off-scale', () => {
    expect(findRawFontSizes('font-size: 28px; /* off-scale: stat value */')).toEqual([]);
  });

  it('ignores other properties', () => {
    expect(findRawFontSizes('line-height: 18px; padding: 12px;')).toEqual([]);
  });
});
