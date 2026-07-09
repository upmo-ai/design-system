# @upmo-ai/icons

The Upmo icon map. Each key in `icons.json` is a concept the interface needs (`action.send`, `status.done`, `object.repository`); the value is a [Tabler Icons 3](https://tabler.io/icons) outline name, or `caret` / `status-*` for Upmo's own marks. Keys never change once shipped.

| Export | What it holds |
| --- | --- |
| `@upmo-ai/icons` | `icons` (the typed map), `set`, `stroke`, and the `IconConcept` and `IconName` types |
| `@upmo-ai/icons/icons.json` | The source map |
| `@upmo-ai/icons/svg/caret.svg` and the other files in `svg/` | The caret in emerald, ink and bone, and the five status carets, copied from `content/assets/icons` |

```tsx
import { icons } from '@upmo-ai/icons';

icons['nav.tasks']; // 'list-check', so <IconListCheck size={20} stroke={1.75} /> from @tabler/icons-react
```

Tabler glyphs are not copied here; install `@tabler/icons-react` next to this package. The status SVGs have their ink baked in, so an `<img>` cannot recolour them.

Rules for size, stroke, colour and labels: [Icons](https://design.upmo.dev/foundations/icons/) (source: `content/icons.md`).
