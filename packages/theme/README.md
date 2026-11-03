# @upmo-ai/theme

The Mantine 9 theme for Upmo, built entirely from `@upmo-ai/tokens`. No colour,
spacing or radius literals: every value reads a token.

It exports three things:

- `upmoTheme` - the Mantine `createTheme` object (primary colour, type and
  radius scales, breakpoints, component defaults for the crisp, sharp, bordered
  look).
- `cssVariablesResolver` - maps Mantine's internal colour variables onto the
  Upmo token variables. Mantine writes its colours as inline variables on the
  document, which a stylesheet cannot override, so this resolver is required for
  the page ground, text, borders and the primary fill to follow the tokens.
- `tokenVariables` - the raw Mantine-name to token-variable map, for tests and
  for the docs preview pipeline.

It sits between `@upmo-ai/tokens` (the foundation it reads) and
`@upmo-ai/components` (the React library that uses this theme).

## Install

```sh
pnpm add @upmo-ai/theme @upmo-ai/tokens @mantine/core
```

Peer dependency: `@mantine/core` (^9.7.4).

## Usage

```tsx
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import { MantineProvider } from '@mantine/core';
import { upmoTheme, cssVariablesResolver } from '@upmo-ai/theme';

export function App({ children }) {
  return (
    <MantineProvider theme={upmoTheme} cssVariablesResolver={cssVariablesResolver}>
      {children}
    </MantineProvider>
  );
}
```

Import order matters: Mantine's CSS first, then the tokens CSS, then
`@upmo-ai/components/styles.css` if you use the components, then any local
overrides.

## The dark primary fill

The dark primary button uses a brighter, more saturated emerald than the light
one, so it stays vivid on the dark ground. This is done two ways that agree:
Mantine's `primaryShade` is `{ light: 7, dark: 5 }`, and the resolver pins the
filled primary to the `--primary-fill` token (which is scheme-aware in
`@upmo-ai/tokens`). A hover glow (`--glow-primary`) applies in dark only.

## Build

```sh
pnpm --filter @upmo-ai/theme build   # tsup: ESM + d.ts
```

## Links

- Documentation: https://design.upmo.dev
- Source: https://github.com/upmo-ai/design-system

## Licence

AGPL-3.0-only.
