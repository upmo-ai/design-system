import { DEFAULT_THEME, getPrimaryShade, mergeMantineTheme } from '@mantine/core';
import { breakpoint, color, font } from '@upmo-ai/tokens';
import { describe, expect, it } from 'vitest';
import { upmoTheme } from '../src/index.ts';

const theme = mergeMantineTheme(DEFAULT_THEME, upmoTheme);
const primary = (scheme: 'light' | 'dark') => theme.colors[theme.primaryColor][getPrimaryShade(theme, scheme)];

describe('upmoTheme', () => {
  it('uses the emerald scale from the tokens as the primary colour', () => {
    expect(theme.primaryColor).toBe('emerald');
    expect(theme.colors.emerald).toHaveLength(10);
    expect(theme.colors.emerald[6]).toBe(color.emerald.light);
  });

  it('resolves the primary shade to emerald-deep in both schemes', () => {
    expect(primary('light')).toBe(color['emerald-deep'].light);
    expect(primary('dark')).toBe(color['emerald-deep'].dark);
  });

  it('takes fonts and breakpoints from the tokens', () => {
    expect(theme.fontFamily).toBe(font.ui);
    expect(theme.fontFamilyMonospace).toBe(font.mono);
    expect(theme.breakpoints.md).toBe(breakpoint['bp-md']);
  });

  it('turns px line heights into the ratios Mantine expects', () => {
    expect(theme.headings.sizes.h1).toMatchObject({ lineHeight: '1.29', fontWeight: '700' });
    expect(theme.headings.sizes.h3.lineHeight).toBe('1.4');
    expect(theme.lineHeights.md).toBe('1.47');
  });

  it('closes toasts after 5s and pauses only the hovered one', () => {
    expect(theme.components.Notifications.defaultProps).toMatchObject({ autoClose: 5000, pauseResetOnHover: 'notification' });
  });
});
