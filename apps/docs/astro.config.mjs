import { readFileSync } from 'node:fs';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { componentGroups, readComponents, releaseVersion } from './scripts/lib.ts';

const fonts =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Familjen+Grotesk:wght@700&family=Fira+Code:wght@400&display=swap';
const groups = componentGroups(readComponents(new URL('../../content/', import.meta.url)));
const version = releaseVersion(new URL('../../packages/', import.meta.url));

export default defineConfig({
  site: 'https://design.upmo.dev',
  vite: { define: { __UPMO_VERSION__: JSON.stringify(version) } },
  integrations: [
    starlight({
      title: 'Upmo Design System',
      logo: {
        light: '../../content/assets/logos/upmo-wordmark-light.svg',
        dark: '../../content/assets/logos/upmo-wordmark-dark.svg',
      },
      favicon: '/favicon.svg',
      components: { SiteTitle: './src/components/SiteTitle.astro' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/upmo-ai/design-system' }],
      customCss: ['@upmo-ai/tokens/tokens.css', './src/styles/upmo.css', './src/styles/docs.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: fonts } },
        { tag: 'script', content: readFileSync(new URL('./src/preview/preview.js', import.meta.url), 'utf8') },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            'getting-started/overview',
            'getting-started/principles',
            'getting-started/install',
            'getting-started/mantine',
            'getting-started/changelog',
          ],
        },
        {
          label: 'Foundations',
          items: [
            'foundations/tokens',
            'foundations/contrast',
            { slug: 'foundations/responsive', label: 'Typography and responsive' },
            'foundations/icons',
            'foundations/motion',
            'foundations/accessibility',
            'foundations/dataviz',
          ],
        },
        { label: 'Content', items: ['content/glossary', 'content/microcopy', 'content/marketing'] },
        { label: 'Patterns', items: ['patterns', 'patterns/forms'] },
        {
          label: 'Components',
          items: [
            { slug: 'components', label: 'All components' },
            ...groups.map(({ label, components }) => ({
              label,
              collapsed: true,
              items: components.map((c) => `components/${c.slug}`),
            })),
          ],
        },
        { label: 'Brand', items: ['brand/logos', 'brand/icons', 'brand/brands', 'brand/languages', 'brand/exports'] },
      ],
    }),
  ],
});
