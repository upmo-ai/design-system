# @upmo-ai/brands

Official marks of the model providers, connectors and runtimes Upmo connects to, for pickers and connector rows (`BrandTile`, `BrandSelect`), and the marks of programming languages for the `CodeBlock` header.

| Export | What it holds |
| --- | --- |
| `@upmo-ai/brands` | `brands`: one entry per mark, `{ id, file, deep, currentColor }`, and the `BrandId` type. `languages`: the same shape for language marks, and the `LanguageId` type |
| `@upmo-ai/brands/brands.json` | The same manifest as JSON: `{ brands, languages }` |
| `@upmo-ai/brands/svg/<id>.svg` | The SVG files, copied from `content/assets/brands` |
| `@upmo-ai/brands/svg/languages/<id>.svg` | The language marks for the `CodeBlock` header, copied from `content/assets/languages` |

- `deep` is true when the SVG carries `u-brand--deep`: its published colour is too dark for a dark ground, so it draws in `ink` on the dark and hc themes.
- `currentColor` is true when the mark has no fixed colour and draws in `currentColor`, so it takes the surrounding text colour.
- `file` is the path under `svg/`, so a language mark reads `languages/go.svg`.

## Trademarks

These marks are not Upmo's and are not covered by this repository's licence. Each remains the trademark of its owner. Upmo uses them only to identify the third-party service next to its name (nominative use) and claims no affiliation. The SVG files come from Lobe Icons (MIT) and Simple Icons (CC0) or from the owner's own site; that licence covers the file data only. Simple Icons records MIT or CC BY-SA 4.0 for four language marks (`javascript`, `bash`, `rust`, `php`); [`content/assets/languages/README.md`](https://github.com/upmo-ai/design-system/blob/main/content/assets/languages/README.md) names them.

Use them as the rules in [`content/assets/brands/README.md`](https://github.com/upmo-ai/design-system/blob/main/content/assets/brands/README.md) say: official artwork in official colours, never reshaped or recoloured, always beside the service's name, only in pickers, connector lists and "Connected to" lines. Language marks go only in the `CodeBlock` header, at 16px, next to the language name. Never in the Upmo wordmark, the app icon, the landing hero or ads, and never next to "powered by" or "partner" without a written agreement. That file also lists the source and the brand guidelines for every mark.

The licence texts for the Lobe Icons and Simple Icons files are in [THIRD_PARTY_NOTICES.md](https://github.com/upmo-ai/design-system/blob/main/THIRD_PARTY_NOTICES.md).
