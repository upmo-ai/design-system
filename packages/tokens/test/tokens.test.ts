import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toCss, toData, toModule, type TokenFile } from '../scripts/lib.ts';

const tokens: TokenFile = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const reference = readFileSync(new URL('./fixtures/tokens.ref.css', import.meta.url), 'utf8');
const withoutHeader = (css: string) => css.split('\n').slice(1).join('\n');

describe('toCss', () => {
  const css = toCss(tokens);

  it('matches the reference build line for line after the header comment', () => {
    expect(withoutHeader(css)).toBe(withoutHeader(reference));
  });

  it('names the token set in the header', () => {
    expect(css.split('\n')[0]).toBe('/* Upmo, generated from tokens.json */');
  });

  it('writes one block per theme, light first and on :root', () => {
    expect(css).toContain(':root, [data-theme="light"] {');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('[data-theme="hc"] {');
  });

  it('keeps alias tokens as CSS variable references', () => {
    expect(css).toContain('  --success: var(--emerald-deep);');
  });
});

describe('toData', () => {
  const data = toData(tokens);

  it('resolves alias tokens to the target value in each theme', () => {
    expect(data.color.success).toEqual(data.color['emerald-deep']);
    expect(data.color['chart-mid'].dark).toBe('#3a423d');
  });

  it('keeps the undrawn caret stroke apart from ink in every theme', () => {
    expect(data.color['caret-idle']).toEqual({ light: '#7c847e', dark: '#6f7873', hc: '#5e6662' });
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(data.color['caret-idle'][theme]).not.toBe(data.color.ink[theme]);
    }
  });

  it('repeats single-value colours in every theme', () => {
    expect(data.color['emerald-7']).toEqual({ light: '#176b47', dark: '#176b47', hc: '#176b47' });
  });

  it('falls back to the light value where a theme is missing', () => {
    expect(data.shadow['shadow-sm'].hc).toBe(data.shadow['shadow-sm'].light);
  });

  it('carries every non-colour family and the type styles', () => {
    expect(data.spacing['space-4']).toBe('16px');
    expect(data.breakpoint['bp-md']).toBe('62em');
    expect(data.typography.h1).toEqual({
      family: 'ui',
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    });
    expect(data.typography.body).not.toHaveProperty('letterSpacing');
  });

  it('throws on an alias to a token that does not exist', () => {
    const broken = structuredClone(tokens);
    broken.color.tokens.push({ name: 'broken', value: '{nope}' });
    expect(() => toData(broken)).toThrow(/unknown token/);
  });
});

describe('toModule', () => {
  const { js, dts } = toModule(tokens);

  it('exports every family from the JS module', () => {
    for (const name of ['themes', 'color', 'shadow', 'spacing', 'radius', 'size', 'breakpoint', 'zIndex', 'motion', 'font', 'typography']) {
      expect(js).toContain(`export const ${name} = `);
      expect(dts).toContain(`export declare const ${name}: `);
    }
  });

  it('types token values as literals', () => {
    expect(dts).toContain('readonly "surface-000": {\n    readonly "light": "#f2f0ea";');
    expect(dts).toContain('export type ColorToken = keyof typeof color;');
  });
});
