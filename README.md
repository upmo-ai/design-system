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
| `@upmo-ai/theme` | The Mantine 9 theme built from tokens, the CSS-variables resolver that maps Mantine onto Upmo tokens, and the color-scheme wiring. |
| `@upmo-ai/components` | The React component library: themed, accessible Mantine 9 components built on Upmo tokens. |
| `@upmo-ai/icons` | Icon concept map (concept to Tabler Icons name) and the caret mark as SVG. |
| `@upmo-ai/brands` | Marks of the services Upmo connects to, as `currentColor` SVG, with a typed manifest. |

## Apps

| App | What it is |
| --- | --- |
| `apps/storybook` | The component gallery: every component in light, dark and high contrast (`pnpm --filter @upmo-ai/storybook dev`). |
| `apps/docs` | The documentation site, built with Astro Starlight (`pnpm --filter @upmo-ai/docs dev`). |

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

## Community

Licensed under [AGPL-3.0-only](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md)
to get involved, [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for how we work
together, and [SECURITY.md](SECURITY.md) to report a vulnerability.
