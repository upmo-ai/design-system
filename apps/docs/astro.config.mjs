import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const fonts =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Familjen+Grotesk:wght@700&family=Fira+Code:wght@400&display=swap';

export default defineConfig({
  site: 'https://design.upmo.dev',
  integrations: [
    react(),
    starlight({
      title: 'Upmo Design System',
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/upmo-ai/upmo-design-system' }],
      // Tokens first so component styles and islands read the variables, then
      // the component library's own module styles, then docs chrome.
      customCss: ['@upmo-ai/tokens/tokens.css', '@upmo-ai/components/styles.css', './src/styles/docs.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: fonts } },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: ['getting-started/overview', 'getting-started/principles', 'getting-started/install'],
        },
        {
          label: 'Foundations',
          items: ['foundations/tokens'],
        },
        {
          label: 'Controls',
          items: ['controls/button', 'controls/status'],
        },
      ],
    }),
  ],
});
