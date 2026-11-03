# @upmo-ai/components

The Upmo React component library: themed, accessible Mantine 9 components built
on Upmo tokens. It sits on top of the other packages: `@upmo-ai/tokens` supplies
the CSS variables, `@upmo-ai/theme` the Mantine theme, `@upmo-ai/icons` the icon
concept map and `@upmo-ai/brands` the provider marks.

## Install

```sh
pnpm add @upmo-ai/components @upmo-ai/tokens @upmo-ai/theme @upmo-ai/icons @upmo-ai/brands \
  @mantine/core @mantine/hooks @tabler/icons-react react react-dom
```

Peer dependencies: `@mantine/core` and `@mantine/hooks` (^9.7.4),
`@tabler/icons-react` (^3), `react` and `react-dom` (^19), plus the three Upmo
packages above. `@mantine/dates` and `dayjs` are optional peers, needed only for
the `@upmo-ai/components/dates` subpath (`DateInput`).

## Usage

Import the CSS in this order: Mantine, tokens, components, then your own CSS.
Fonts come from `@upmo-ai/tokens/fonts.css`.

```tsx
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '@upmo-ai/tokens/fonts.css';
import '@upmo-ai/components/styles.css';
import './app.css';

import { UpmoProvider, Button, StatusBadge } from '@upmo-ai/components';

export function App() {
  return (
    <UpmoProvider theme="system">
      <StatusBadge status="Working" />
      <Button>Approve</Button>
    </UpmoProvider>
  );
}
```

`UpmoProvider` takes `theme` (`'light'`, `'dark'`, `'hc'` or `'system'`, the
default) and `reducedMotion` (`'system'`, `'reduce'` or `'no-preference'`).
`StatusBadge` takes a `status` such as `Working`, `Done` or `Needs approval`.

## Links

- Documentation: https://design.upmo.dev
- Source: https://github.com/upmo-ai/design-system

## Licence

AGPL-3.0-only.
