# Upmo design system

The design system for [Upmo](https://upmo.ai): tokens, theme, icons, brand
assets, a real React component library, and a documentation site. Upmo runs
always-on AI agents on infrastructure you own. This repo is the single source of
truth the product consumes.

Tagline: Always working. Always yours.

## Packages

| Package | What it is |
| --- | --- |
| `@upmo-ai/tokens` | Design tokens: CSS variables (light / dark / high-contrast) + a typed JS object. No React. |
| `@upmo-ai/theme` | The Mantine 9 theme built from tokens. _(coming next)_ |
| `@upmo-ai/components` | The real React component library. _(coming)_ |
| `@upmo-ai/icons` | Icon concept map + the custom caret and status marks. _(coming)_ |
| `@upmo-ai/brands` | Provider / connector brand marks + manifest. _(coming)_ |

## Design direction

- A control room for an always-on AI workforce you own: professional, crisp,
  sharp-bordered, dense where data lives, icon + text everywhere.
- Three principles: alive not noisy; autonomy with a hand on the wheel; yours,
  visibly.
- True-neutral grounds (Ramp-like). Emerald is a sparing accent. Borders carry
  structure; shadows lift floating layers only.
- Accessible floor: 4.5:1 body text, 3:1 control edges, keyboard reachable with
  one focus ring, full reduced-motion support.

## Develop

Requires Node >= 24 and pnpm.

```sh
pnpm install
pnpm build          # build every package
pnpm test           # run unit tests
pnpm lint           # hex + glossary + typecheck
```

## Licence

AGPL-3.0-only.
