import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toCss, toData, type TokenFile } from '../scripts/lib.ts';

const tokens: TokenFile = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const data = toData(tokens);
const css = toCss(tokens);

describe('tokens', () => {
  it('declares the three themes', () => {
    expect(data.themes).toEqual(['light', 'dark', 'hc']);
  });

  it('resolves every colour token in all three themes', () => {
    for (const [name, byTheme] of Object.entries(data.color)) {
      for (const theme of data.themes) {
        const v = (byTheme as Record<string, string>)[theme];
        expect(v, `${name} missing ${theme}`).toBeTruthy();
        // No alias should survive into the resolved data.
        expect(v.startsWith('{'), `${name}.${theme} is an unresolved alias`).toBe(false);
      }
    }
  });

  it('resolves aliases to the value they point at', () => {
    expect(data.color['success']).toEqual(data.color['emerald-deep']);
    expect(data.color['live-activity']).toEqual(data.color['emerald-deep']);
    expect(data.color['chart-mid']).toEqual(data.color['mist']);
  });

  it('emits a scope for each theme in the CSS', () => {
    expect(css).toContain(':root, [data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-theme="hc"]');
  });

  it('keeps the live caret draw-sweep loop and crisp minimal action radius', () => {
    expect(data.motion['duration-sweep']).toBe('1600ms');
    expect(data.radius['radius-xs']).toBe('2px');
  });

  it('carries typography styles with the expected shape', () => {
    expect(data.typography['body']).toMatchObject({ family: 'ui', fontSize: '15px' });
  });
});
