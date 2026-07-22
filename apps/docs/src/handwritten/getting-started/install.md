---
title: Install
description: Use the Upmo packages in a React app built on Mantine 9.
---

The system ships as four packages under the `@upmo-ai` scope. They are not on npm yet. Install them from a release tag of this repository.

| Package | What it holds |
| --- | --- |
| `@upmo-ai/tokens` | `tokens.css`, the CSS variables for the light, dark and high-contrast themes, and a typed object of every token |
| `@upmo-ai/ui` | `upmoTheme`, the Mantine theme built from the tokens. Components follow later. |
| `@upmo-ai/icons` | The map from interface concepts to Tabler Icons names, and the caret and status SVGs |
| `@upmo-ai/brands` | The marks of the services Upmo connects to, as SVG, with a manifest |

## Add the packages

Point each package at a release tag and its folder in the repository:

```json
{
  "dependencies": {
    "@upmo-ai/tokens": "git+https://github.com/upmo-ai/design-system.git#v0.1.0&path:/packages/tokens",
    "@upmo-ai/ui": "git+https://github.com/upmo-ai/design-system.git#v0.1.0&path:/packages/ui",
    "@mantine/core": "^9.4.0",
    "@mantine/hooks": "^9.4.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

Use the same tag for every `@upmo-ai` package. The releases are in the [changelog](/getting-started/changelog/). `@upmo-ai/icons` and `@upmo-ai/brands` install the same way, with their own `path:`.

Each package builds its `dist` folder when pnpm installs it from git. pnpm 11 runs build scripts of git dependencies only when you allow them, so add the packages to `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@upmo-ai/tokens@git+https://github.com/upmo-ai/design-system.git': true
  '@upmo-ai/ui@git+https://github.com/upmo-ai/design-system.git': true
```

`@upmo-ai/ui` needs `@mantine/core` and `@mantine/hooks` 9.4 or later, and `react` and `react-dom` 19.2 or later.

## Load the styles

Import Mantine's styles first, then the tokens, then one small file that points Mantine's surface and text variables at the tokens. That file is the CSS block in [Mantine mapping](/getting-started/mantine/#surface-and-text-variables).

```tsx
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import './upmo-mantine.css';
```

## Wrap the app

```tsx
import { MantineProvider } from '@mantine/core';
import { upmoTheme } from '@upmo-ai/ui';

export function App({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={upmoTheme}>{children}</MantineProvider>;
}
```

## Keep the themes in sync

The tokens switch on `data-theme`; Mantine switches on `data-mantine-color-scheme`. Drive both from Mantine's colour scheme:

```tsx
import { useComputedColorScheme } from '@mantine/core';
import { useEffect } from 'react';

export function ThemeSync() {
  const scheme = useComputedColorScheme('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', scheme);
  }, [scheme]);
  return null;
}
```

The high-contrast theme is `data-theme="hc"` with Mantine's light scheme. See [High contrast and colour vision](/foundations/contrast/).

## Fonts

Load Manrope (400 to 700) and Fira Code, from Google Fonts or self-hosted, with `font-display: swap`. Familjen Grotesk 700 is for marketing pages only.

## Icons and marks

```ts
import { icons } from '@upmo-ai/icons';
import { brands, languages } from '@upmo-ai/brands';

icons['action.send']; // 'caret': use the Upmo caret, not a Tabler glyph
brands.find((b) => b.id === 'slack'); // { id: 'slack', file: 'slack.svg', deep: true, currentColor: false }
languages.find((l) => l.id === 'go'); // { id: 'go', file: 'languages/go.svg', deep: false, currentColor: false }
```

The SVG files are at `@upmo-ai/icons/svg/<name>.svg`, `@upmo-ai/brands/svg/<id>.svg` and `@upmo-ai/brands/svg/languages/<id>.svg`. Tabler glyphs come from `@tabler/icons-react`, `size={20}` and `stroke={1.75}`. Read [Icons](/foundations/icons/), [Brands](/brand/brands/) and [Languages](/brand/languages/) before placing any of them.
