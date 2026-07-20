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
  it('maps Mantine internals onto Upmo tokens, the same in light and dark', () => {
    const resolved = cssVariablesResolver({} as MantineTheme);
    expect(resolved.light).toEqual(tokenVariables);
    expect(resolved.dark).toEqual(tokenVariables);
    expect(resolved.variables).toEqual({});
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
});
