import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toCss, toData, toFontFaces, type TokenFile } from '../scripts/lib.ts';

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

  it('emits every type style as :root size, line and weight variables, plus tracking where set', () => {
    const root = css.slice(css.lastIndexOf(':root {'));
    expect(root).toContain('--text-body-size: 15px;');
    expect(root).toContain('--text-body-line: 22px;');
    expect(root).toContain('--text-body-weight: 400;');
    expect(root).toContain('--text-overline-tracking: 0.06em;');
    expect(root).not.toContain('--text-body-tracking');
    for (const [name, s] of Object.entries(data.typography)) {
      expect(root, name).toContain(`--text-${name}-size: ${s.fontSize};`);
      expect(root, name).toContain(`--text-${name}-line: ${s.lineHeight};`);
      expect(root, name).toContain(`--text-${name}-weight: ${s.fontWeight};`);
    }
  });
});

// WCAG 2.x relative luminance and contrast ratio.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
type Theme = 'light' | 'dark' | 'hc';
const c = (name: string, theme: Theme) => (data.color as Record<string, Record<Theme, string>>)[name][theme];

describe('colour contrast', () => {
  it('keeps metadata readable in a selected row and on hover', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(contrast(c('ink-muted', theme), c('surface-selected', theme)), theme).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c('ink-muted', theme), c('surface-hover', theme)), theme).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c('emerald-deep', theme), c('emerald-soft', theme)), theme).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps the selection ground identical to emerald-soft and distinct from raised surfaces', () => {
    expect(data.color['surface-selected']).toEqual(data.color['emerald-soft']);
    expect(contrast(c('surface-selected', 'dark'), c('surface-100', 'dark'))).toBeGreaterThanOrEqual(1.25);
  });

  it('gives the active nav bar 3:1 against the rail ground and the selected ground', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(contrast(c('emerald-deep', theme), c('surface-200', theme)), theme).toBeGreaterThanOrEqual(3);
      expect(contrast(c('emerald-deep', theme), c('surface-selected', theme)), theme).toBeGreaterThanOrEqual(3);
      expect(contrast(c('emerald-deep', theme), c('surface-100', theme)), theme).toBeGreaterThanOrEqual(3);
    }
  });

  it('makes hover visible against both grounds', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(contrast(c('surface-hover', theme), c('surface-100', theme)), theme).toBeGreaterThanOrEqual(1.2);
    }
    expect(contrast(c('surface-hover', 'dark'), c('surface-000', 'dark'))).toBeGreaterThanOrEqual(1.25);
  });

  it('keeps high-contrast disabled text perceivable but clearly below ink-muted', () => {
    const disabled = contrast(c('ink-disabled', 'hc'), c('surface-000', 'hc'));
    expect(disabled).toBeGreaterThanOrEqual(3);
    expect(contrast(c('ink-disabled', 'hc'), c('surface-200', 'hc'))).toBeGreaterThanOrEqual(3);
    expect(contrast(c('ink-muted', 'hc'), c('surface-000', 'hc'))).toBeGreaterThan(disabled * 2);
  });

  it('keeps danger text (calendar weekends) at 4.5:1 on overlays and their hover', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(contrast(c('danger', theme), c('surface-100', theme)), theme).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c('danger', theme), c('surface-hover', theme)), theme).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps the idle caret at 3:1 on the page ground', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      expect(contrast(c('caret-idle', theme), c('surface-000', theme)), theme).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives every theme a monotone five-step ordinal ramp; high contrast clears 3:1 at every step', () => {
    for (const theme of ['light', 'dark', 'hc'] as const) {
      const ramp = [1, 2, 3, 4, 5].map((i) => contrast(c(`chart-ord-${i}`, theme), c('surface-100', theme)));
      // Light and hc darken toward step 5; dark darkens too (toward its ground), so contrast falls.
      const rising = theme !== 'dark';
      for (let i = 1; i < ramp.length; i++) {
        expect(rising ? ramp[i] > ramp[i - 1] : ramp[i] < ramp[i - 1], `${theme} step ${i + 1}`).toBe(true);
      }
      for (const r of ramp) expect(r, theme).toBeGreaterThanOrEqual(theme === 'hc' ? 3 : 2);
    }
  });

  it('keeps the greys true-neutral: no green cast', () => {
    const greys = ['ink-muted', 'ink-disabled', 'caret-idle', 'mist', 'border-strong'];
    for (const name of greys) {
      for (const theme of ['light', 'dark', 'hc'] as const) {
        const hex = c(name, theme);
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        // Slate neutrals run R <= G <= B; a green cast puts G above B.
        expect(g <= b && r <= g, `${name}.${theme} ${hex}`).toBe(true);
      }
    }
  });
});

describe('fonts', () => {
  const fonts = tokens.type.fonts ?? [];
  // The first family in each stack is the font the tokens ship.
  const shipped = (family: string) =>
    fonts.find((f) => tokens.type.families[family].startsWith(`"${f.family}"`));

  it('ships a face for every family the tokens name', () => {
    for (const family of Object.keys(tokens.type.families)) {
      expect(shipped(family), family).toBeTruthy();
    }
  });

  it('ships every weight a type style uses', () => {
    for (const [name, s] of Object.entries(data.typography)) {
      expect(shipped(String(s.family))?.weights, name).toContain(Number(s.fontWeight));
    }
  });

  it('keeps the listed subsets, their unicode ranges, and only the woff2 source', () => {
    const face = (subset: string, range: string) => `/* manrope-${subset}-400-normal */
@font-face {
  font-family: 'Manrope';
  font-weight: 400;
  src: url(./files/manrope-${subset}-400-normal.woff2) format('woff2'), url(./files/manrope-${subset}-400-normal.woff) format('woff');
  unicode-range: ${range};
}`;
    const sheet = [face('cyrillic', 'U+0400-045F'), face('latin-ext', 'U+0100-02BA'), face('latin', 'U+0000-00FF')].join('\n\n');
    const { css, files } = toFontFaces(sheet, 'manrope', ['latin', 'latin-ext']);
    expect(files).toEqual(['manrope-latin-ext-400-normal.woff2', 'manrope-latin-400-normal.woff2']);
    expect(css).toContain("src: url(./fonts/manrope-latin-400-normal.woff2) format('woff2');");
    expect(css).toContain('unicode-range: U+0000-00FF;');
    expect(css).toContain('unicode-range: U+0100-02BA;');
    expect(css).not.toContain('cyrillic');
    expect(css).not.toContain('.woff)');
  });
});
