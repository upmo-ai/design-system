# @upmo-ai/ui

The Upmo theme for [Mantine 9](https://mantine.dev). `upmoTheme` is a `createTheme` object built from `@upmo-ai/tokens`: the emerald scale as the primary colour (shade 7 in light, 4 in dark), Manrope and Fira Code, the heading and text sizes, spacing, radius, shadows, breakpoints and the component defaults from [Mantine mapping](https://design.upmo.dev/getting-started/mantine/).

There are no components in this package yet. Upmo-specific components (the caret loader, `CaretStatus`, the brand pickers) come later; until then the docs site shows their HTML reference previews.

```tsx
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import { MantineProvider } from '@mantine/core';
import { upmoTheme } from '@upmo-ai/ui';

export function App({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={upmoTheme}>{children}</MantineProvider>;
}
```

The theme holds no colour literal beyond the emerald scale. Mantine's surface and text variables point at the tokens through the CSS block in Mantine mapping; keep `data-theme` and Mantine's colour scheme in sync. See [Install](https://design.upmo.dev/getting-started/install/).

Peer dependencies: `@mantine/core` and `@mantine/hooks` 9.4 or later, `react` and `react-dom` 19.2 or later.
