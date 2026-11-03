# @upmo-ai/tokens

Upmo design tokens: the single source of truth for colour, type, spacing,
radius, shadow, size, breakpoint, z-index and motion. Built from `tokens.json`
into three artifacts:

- `dist/tokens.css` - CSS custom properties for the `light`, `dark` and `hc`
  (high-contrast) themes, scoped by `:root` and `[data-theme="..."]`, plus
  typography utility classes (`.body`, `.h1`, `.code`, etc.). Each type style
  is also a set of `:root` variables: `--text-<style>-size`, `-line`,
  `-weight` and, where the style sets letter-spacing, `-tracking` (for example
  `--text-body-size: 15px`, `--text-overline-tracking: 0.06em`).
- `dist/tokens.js` + `dist/tokens.d.ts` - a typed JS object of every value,
  per theme, for when CSS variables are not enough (charts, canvas, JS logic).
- `dist/tokens.json` - the raw source, copied for tooling.
- `dist/fonts.css` + `dist/fonts/` - `@font-face` rules for the token fonts
  (Manrope 400/500/600/700, Familjen Grotesk 700, Fira Code 400; latin and
  latin-ext) with the woff2 files and their SIL OFL 1.1 licences. The files are
  copied from `@fontsource` at build time, so the package keeps no runtime
  dependency. The faces to ship are listed in `tokens.json` under `type.fonts`.

No React, no runtime dependencies.

## Usage

```ts
import '@upmo-ai/tokens/tokens.css';
import '@upmo-ai/tokens/fonts.css';
import { color, spacing, motion } from '@upmo-ai/tokens';

color['emerald-deep'].light; // "#176b47"
motion['duration-sweep'];     // "1600ms"
```

Set the theme on a root element:

```html
<html data-theme="dark"> ... </html>
```

## Design direction

- **True-neutral grounds.** Ramp-like, business and data-dense. Borders carry
  structure; shadows lift floating layers only. Emerald is a sparing accent,
  never a surface fill.
- **Status / liveness tones.** neutral / active / positive / attention /
  critical. The live caret (Working, Checking) draws itself on the
  `duration-sweep` loop and collapses to a static drawn caret under reduced
  motion.
- **Accessible floor.** Body text clears 4.5:1 on its stated ground; control
  edges and large/icon colour clear 3:1; verified in light and dark. The
  high-contrast theme raises everything further.

## Build

```sh
pnpm --filter @upmo-ai/tokens build
```
