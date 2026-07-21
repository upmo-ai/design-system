import { MantineProvider } from '@mantine/core';
import { cssVariablesResolver, upmoTheme } from '@upmo-ai/theme';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export type PreviewTheme = 'light' | 'dark' | 'hc';

const mantineScheme: Record<PreviewTheme, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  hc: 'light',
};

function wrapper(theme: PreviewTheme) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MantineProvider
        theme={upmoTheme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme={mantineScheme[theme]}
      >
        <div data-theme={theme}>{children}</div>
      </MantineProvider>
    );
  };
}

/** Render a component inside the Upmo theme for a given theme (default light). */
export function renderThemed(ui: ReactElement, theme: PreviewTheme = 'light', options?: RenderOptions) {
  return render(ui, { wrapper: wrapper(theme), ...options });
}

export const themes: PreviewTheme[] = ['light', 'dark', 'hc'];
