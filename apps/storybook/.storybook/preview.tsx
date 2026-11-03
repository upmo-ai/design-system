import { UpmoProvider, type UpmoProviderProps } from '@upmo-ai/components';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';

// Styles, in cascade order: Mantine base (core, then dates for DateInput), then
// Upmo tokens (which switch on [data-theme]), then the component library's own
// prefixed stylesheet, then the token fonts.
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '@upmo-ai/components/styles.css';
import '@upmo-ai/tokens/fonts.css';

// Each story runs in Storybook's own preview iframe, a dedicated document, so
// UpmoProvider owns the document root: it writes the Upmo data-theme token scope
// and Mantine's colour scheme and CSS variables onto :root. Because the
// variables live on :root, portaled content (Modal, Tooltip, Menu dropdowns) is
// styled correctly even though it renders at document.body, outside the story
// subtree.
const withUpmoTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as UpmoProviderProps['theme'];

  useEffect(() => {
    document.body.style.background = 'var(--surface-000)';
    document.body.style.color = 'var(--ink)';
  }, []);

  return (
    <UpmoProvider theme={theme}>
      <Story />
    </UpmoProvider>
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
          { value: 'system', title: 'System' },
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
