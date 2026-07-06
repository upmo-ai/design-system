# @upmo-ai/tokens

Every colour, size, radius, shadow, duration and type style in the Upmo design system. `tokens.json` is the source; the build writes the rest.

| Export | File | What it holds |
| --- | --- | --- |
| `@upmo-ai/tokens/tokens.css` | `dist/tokens.css` | CSS variables. Light on `:root` and `[data-theme="light"]`, dark on `[data-theme="dark"]`, high contrast on `[data-theme="hc"]`, then the theme-independent values and one class per type style. |
| `@upmo-ai/tokens` | `dist/tokens.js`, `dist/tokens.d.ts` | The same values as a typed object: `color` and `shadow` per theme (aliases resolved), `spacing`, `radius`, `size`, `breakpoint`, `zIndex`, `motion`, `font`, `typography`. |
| `@upmo-ai/tokens/tokens.json` | `dist/tokens.json` | The source file, with usage notes for every token. |

```css
@import '@upmo-ai/tokens/tokens.css';

.card {
  background: var(--surface-100);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
```

```ts
import { color, type ColorToken } from '@upmo-ai/tokens';

color['emerald-deep'].dark; // '#4fae7f'
```

Set `data-theme` on the root element to switch themes. Components read tokens only, never a literal.

## Build

`pnpm --filter @upmo-ai/tokens build` runs `scripts/build.ts`. The test in `test/` checks the CSS against `test/fixtures/tokens.ref.css`, a reviewed build kept as the reference.

Documentation: [design.upmo.dev](https://design.upmo.dev/foundations/tokens/).
