import type { MantineTheme } from '@mantine/core';
import { color } from '@upmo-ai/tokens';
import { describe, expect, it } from 'vitest';
import { cssVariablesResolver, tokenVariables, upmoTheme } from '../src/index.ts';

describe('upmoTheme', () => {
  it('uses emerald as the primary colour with the light/dark shade split', () => {
    expect(upmoTheme.primaryColor).toBe('emerald');
    expect(upmoTheme.primaryShade).toEqual({ light: 7, dark: 5 });
  });

  it('builds the emerald scale from tokens, not literals', () => {
    expect(upmoTheme.colors?.emerald?.[6]).toBe(color['emerald-6'].light);
    expect(upmoTheme.colors?.emerald?.[5]).toBe(color['emerald-5'].light);
  });

  it('reads the Upmo type and radius scale', () => {
    expect(upmoTheme.fontFamily).toContain('Manrope');
    expect(upmoTheme.fontFamilyMonospace).toContain('Fira Code');
    expect(upmoTheme.defaultRadius).toBe('md');
  });

  it('keeps crisp defaults: sharp action radius, bordered flat cards, no decorative shadow', () => {
    expect(upmoTheme.components?.Button?.defaultProps).toMatchObject({ radius: 'xs' });
    expect(upmoTheme.components?.Card?.defaultProps).toMatchObject({ withBorder: true });
    expect((upmoTheme.components?.Card?.defaultProps as Record<string, unknown>).shadow).toBeUndefined();
  });

  it('respects reduced motion', () => {
    expect(upmoTheme.respectReducedMotion).toBe(true);
  });
});

describe('cssVariablesResolver', () => {
  it('maps Mantine internals onto Upmo tokens; light matches tokenVariables', () => {
    const resolved = cssVariablesResolver({} as MantineTheme);
    expect(resolved.light).toEqual(tokenVariables);
    expect(resolved.variables).toEqual({});
    // Shared mappings are identical across schemes.
    expect(resolved.dark['--mantine-color-body']).toBe('var(--surface-000)');
    expect(resolved.dark['--mantine-color-text']).toBe('var(--ink)');
  });

  it('lightens the emerald light-variant in dark so soft badges stay airy', () => {
    const resolved = cssVariablesResolver({} as MantineTheme);
    // Light uses the pale emerald-soft ground directly.
    expect(resolved.light['--mantine-color-emerald-light']).toBe('var(--emerald-soft)');
    // Dark uses a lighter tint on the card surface, not the rich emerald-soft,
    // so a light-variant badge matches the other soft badges.
    expect(resolved.dark['--mantine-color-emerald-light']).toContain('surface-100');
    expect(resolved.dark['--mantine-color-emerald-light']).not.toBe('var(--emerald-soft)');
    expect(resolved.dark['--mantine-primary-color-light']).toContain('surface-100');
  });

  it('points the primary fill at the scheme-aware primary-fill token (bright in dark)', () => {
    expect(tokenVariables['--mantine-primary-color-filled']).toBe('var(--primary-fill)');
    expect(tokenVariables['--mantine-primary-color-filled-hover']).toBe('var(--primary-fill-hover)');
  });

  it('maps the page ground, text and borders onto tokens', () => {
    expect(tokenVariables['--mantine-color-body']).toBe('var(--surface-000)');
    expect(tokenVariables['--mantine-color-text']).toBe('var(--ink)');
    expect(tokenVariables['--mantine-color-default-border']).toBe('var(--border-strong)');
    expect(tokenVariables['--mantine-color-error']).toBe('var(--danger)');
  });

  it('points the red (destructive) fill at the danger token in every scheme', () => {
    const resolved = cssVariablesResolver({} as MantineTheme);
    for (const scheme of [resolved.light, resolved.dark]) {
      expect(scheme['--mantine-color-red-filled']).toBe('var(--danger)');
      expect(scheme['--mantine-color-red-filled-hover']).toContain('var(--danger)');
      expect(scheme['--mantine-color-red-outline']).toBe('var(--danger)');
      expect(scheme['--mantine-color-red-text']).toBe('var(--danger)');
    }
  });
});
