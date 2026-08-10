import { MantineProvider } from '@mantine/core';
import { useIsomorphicEffect, useMediaQuery } from '@mantine/hooks';
import { cssVariablesResolver, upmoTheme } from '@upmo-ai/theme';
import { createContext, useContext, type ReactNode } from 'react';

/** The three Upmo token themes (the [data-theme] scopes in tokens.css). */
export type UpmoThemeName = 'light' | 'dark' | 'hc';

export interface UpmoProviderProps {
  /**
   * The token theme. 'system' (default) follows the OS: prefers-contrast: more
   * resolves to high contrast, then prefers-color-scheme picks light or dark.
   * It live-updates when the OS setting changes.
   */
  theme?: UpmoThemeName | 'system';
  /**
   * The in-app reduced-motion setting. 'system' (default) follows the OS,
   * 'reduce' stops motion regardless of the OS, 'no-preference' ignores the OS.
   */
  reducedMotion?: 'system' | 'reduce' | 'no-preference';
  children?: ReactNode;
}

// Upmo has three token themes; Mantine knows only light and dark. High contrast
// is an Upmo token scope layered on Mantine's light base.
const mantineScheme: Record<UpmoThemeName, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  hc: 'light',
};

// Mantine's own JS transitions read only the OS media query, so 'no-preference'
// switches its respectReducedMotion off; 'reduce' is carried by the root
// attribute that styles.css keys on.
const ignoreReducedMotion = { ...upmoTheme, respectReducedMotion: false };

const UpmoThemeContext = createContext<UpmoThemeName>('light');

// Read synchronously on mount so a dark or high-contrast OS does not flash light.
const mediaOptions = { getInitialValueInEffect: false };

/**
 * The Upmo root provider. Wraps MantineProvider with the Upmo theme and token
 * resolver, writes the [data-theme] token scope onto the document root, and
 * keeps Mantine's colour scheme in step with it. Variables live on :root, so
 * portaled content (Modal, Tooltip, Menu dropdowns) is themed too.
 */
export function UpmoProvider({ theme = 'system', reducedMotion = 'system', children }: UpmoProviderProps) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', undefined, mediaOptions);
  const prefersMoreContrast = useMediaQuery('(prefers-contrast: more)', undefined, mediaOptions);
  const resolved: UpmoThemeName =
    theme !== 'system' ? theme : prefersMoreContrast ? 'hc' : prefersDark ? 'dark' : 'light';

  useIsomorphicEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    return () => root.removeAttribute('data-theme');
  }, [resolved]);

  useIsomorphicEffect(() => {
    if (reducedMotion !== 'reduce') return;
    const root = document.documentElement;
    root.setAttribute('data-reduced-motion', 'reduce');
    return () => root.removeAttribute('data-reduced-motion');
  }, [reducedMotion]);

  return (
    <MantineProvider
      theme={reducedMotion === 'no-preference' ? ignoreReducedMotion : upmoTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={mantineScheme[resolved]}
    >
      <UpmoThemeContext value={resolved}>{children}</UpmoThemeContext>
    </MantineProvider>
  );
}

/** The resolved token theme ('light' | 'dark' | 'hc') of the nearest UpmoProvider. */
export function useUpmoTheme(): UpmoThemeName {
  return useContext(UpmoThemeContext);
}
