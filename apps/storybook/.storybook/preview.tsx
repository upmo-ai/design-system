import { MantineProvider } from '@mantine/core';
import { cssVariablesResolver, upmoTheme } from '@upmo-ai/theme';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';

// Styles, in cascade order: Mantine base, then Upmo tokens (which switch on
// [data-theme]), then the component library's own prefixed stylesheet.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '@upmo-ai/components/styles.css';

// Upmo has three token themes; Mantine knows only light and dark. High contrast
// is an Upmo token scope layered on Mantine's light base.
type UpmoTheme = 'light' | 'dark' | 'hc';

const mantineScheme: Record<UpmoTheme, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  hc: 'light',
};

// Each story runs in Storybook's own preview iframe, a dedicated document, so
// Mantine owns the document root. We let MantineProvider write the colour scheme
// and its CSS variables onto :root (getRootElement -> documentElement,
// cssVariablesSelector ':root'), and we only add the Upmo data-theme token scope
// onto the same root. Because the variables live on :root, portaled content
// (Modal, Tooltip, Menu dropdowns) is styled correctly even though it renders at
// document.body, outside the story subtree.
const withUpmoTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as UpmoTheme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    document.body.style.background = 'var(--surface-000)';
    document.body.style.color = 'var(--ink)';
  }, [theme]);

  return (
    <MantineProvider
      theme={upmoTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={mantineScheme[theme]}
      getRootElement={() => document.documentElement}
      cssVariablesSelector=":root"
    >
      <Story />
    </MantineProvider>
  );
};

const preview: Preview = {
  decorators: [withUpmoTheme],
  globalTypes: {
    theme: {
      description: 'Upmo token theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'hc', title: 'High contrast' },
        ],
      },
    },
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
};

export default preview;
