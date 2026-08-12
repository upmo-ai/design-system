import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Single source of version truth: the repo-root version.json, written by the
// release script. The header badge and the install page both read it so the
// docs always show the released version.
const version = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../version.json', import.meta.url)), 'utf8'),
).version;

const fonts =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Familjen+Grotesk:wght@700&family=Fira+Code:wght@400&display=swap';

export default defineConfig({
  site: 'https://design.upmo.dev',
  vite: {
    define: {
      // Exposes the released version to docs pages and components at build time.
      'import.meta.env.UPMO_VERSION': JSON.stringify(version),
    },
  },
  integrations: [
    starlight({
      title: 'Upmo Design System',
      components: {
        // Adds a version badge next to the wordmark in the header.
        SiteTitle: './src/components/SiteTitle.astro',
      },
      logo: {
        light: './src/assets/upmo-wordmark-light.svg',
        dark: './src/assets/upmo-wordmark-dark.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/upmo-ai/upmo-design-system' }],
      // Tokens theme the docs chrome (Starlight variables map to Upmo tokens in
      // docs.css). Live component previews live in Storybook, not here, so the
      // components stylesheet and the React runtime are no longer loaded.
      customCss: ['@upmo-ai/tokens/tokens.css', './src/styles/docs.css'],
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
          items: ['controls/button', 'controls/status', 'controls/forms', 'controls/navigation'],
        },
        {
          label: 'Compositions',
          items: ['compositions/overview'],
        },
      ],
    }),
  ],
});
