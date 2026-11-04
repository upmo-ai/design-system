# @upmo-ai/brands

The marks of the providers and services Upmo connects to (GitHub, Slack,
Anthropic and others), as SVG, with a typed manifest and recorded sources. It is
data only: no React and no runtime dependencies. It is one of the five Upmo
packages: `@upmo-ai/tokens` is the foundation, and `@upmo-ai/components` reads
`marks` from this package to draw `BrandMark`.

## Install

```sh
pnpm add @upmo-ai/brands
```

No peer dependencies. To render a mark in React, use `BrandMark` from
`@upmo-ai/components`, which also needs `@tabler/icons-react` for its fallback
glyphs.

## Usage

Read the manifest and the inline SVG markup:

```ts
import { brands, marks, type BrandId } from '@upmo-ai/brands';

const id: BrandId = 'github';
const entry = brands.find((brand) => brand.id === id);
entry?.kind; // "connector" or "provider"
marks[id];   // the SVG inner markup for this mark
```

Render a mark with `BrandMark` from `@upmo-ai/components`:

```tsx
import { BrandMark } from '@upmo-ai/components';

<BrandMark brand="github" size={24} />;
<BrandMark brand="anthropic" kind="provider" monochrome />;
```

Some marks also answer to the id people tend to type. `aliases` maps those ids
to the mark id (`gemini` to `googlegemini`, `google-calendar` to
`googlecalendar`, `google-docs` to `googledocs`, `google-drive` to
`googledrive`, `microsoft-teams` to `microsoftteams`, and so on), and `BrandMark` resolves
them for you. Look ids up in lowercase:

```ts
import { aliases, marks } from '@upmo-ai/brands';

const key = 'Google-Drive'.toLowerCase();
const mark = marks[key] ?? marks[aliases[key as keyof typeof aliases]];
```

`BrandMark` falls back to a plug (connector) or server (provider) glyph for an
unknown brand. The package also exposes `@upmo-ai/brands/brands.json` (the
manifest) and `@upmo-ai/brands/svg/*` (one SVG file per mark).

## Links

- Documentation: https://design.upmo.dev
- Source: https://github.com/upmo-ai/design-system

## Licence

AGPL-3.0-only.
