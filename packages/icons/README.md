# @upmo-ai/icons

The Upmo icon concept map. Each key is a concept the interface needs, such as
`nav.tasks` or `action.send`, and each value is the Tabler Icons outline name it
resolves to, or `caret` for Upmo's own live mark (shipped as SVG). Keys never
change once shipped, so the interface can rename a glyph without touching call
sites. The package has no React and no runtime dependencies. It is one of the
five Upmo packages: `@upmo-ai/tokens` is the foundation, and
`@upmo-ai/components` reads this map to render icons.

## Install

```sh
pnpm add @upmo-ai/icons
```

No peer dependencies. To render the glyphs, use the `Icon` component from
`@upmo-ai/components`, which also needs `@tabler/icons-react`.

## Usage

Read the map directly:

```ts
import { icons, stroke, type IconConcept } from '@upmo-ai/icons';

const concept: IconConcept = 'nav.tasks';
icons[concept]; // "list-check" (a Tabler Icons name)
stroke;         // 1.75
```

Render a concept with the `Icon` component from `@upmo-ai/components`:

```tsx
import { Icon } from '@upmo-ai/components';

<Icon concept="action.send" aria-label="Send" />;
```

The package also exposes `@upmo-ai/icons/icons.json` (the raw map) and
`@upmo-ai/icons/svg/*` (the caret mark as SVG).

## Links

- Documentation: https://design.upmo.dev
- Source: https://github.com/upmo-ai/design-system

## Licence

AGPL-3.0-only.
