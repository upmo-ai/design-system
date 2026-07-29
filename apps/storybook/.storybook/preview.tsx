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

// Each story runs in Storybook's own preview iframe, a dedicated document. So
// Mantine can own the document root with data-mantine-color-scheme and we set
// data-theme on the same root for the Upmo token scope, with nothing to collide
// with. This is the whole reason dark mode is trouble-free here: full isolation.
const withUpmoTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as UpmoTheme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mantine-color-scheme', mantineScheme[theme]);
    document.body.style.background = 'var(--surface-000)';
    document.body.style.color = 'var(--ink)';
  }, [theme]);

  return (
    <MantineProvider
      theme={upmoTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={mantineScheme[theme]}
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
