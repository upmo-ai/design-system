# BrandTile

A tile you select to pick one third-party service, such as a provider, a connector or a sandbox runtime.

The official mark helps people recognise the service. The name is what they read.

## When to use

- Use it to pick a provider in onboarding and Settings, a connector in "Add connector", and an engine in agent settings. Use it wherever the options are brands that people already know by their logo.
- Options without a mark (the built-in Upmo engine, "This server") use the plain selectable `Card`.
- A form field with six or more options uses `BrandSelect` instead. The tile grid is for first-run and settings pages.

## What the consumer provides

- `name`, `mark` (an entry from `assets/brands`) and one line of `meta`. The meta line says how the service authenticates, or why it is disabled.
- `selected`, `disabled` (with the reason in `meta`) and `onSelect`. A group is a `radiogroup`.

## Behaviour

- It extends the selectable `Card`. At rest it has `border-strong`. When selected it gets the `emerald-deep` edge and the `surface-selected` ground.
- The radio at the top left fills as a 6px `emerald-deep` ring. The caret check is not used here, because the radio already says "chosen".
- Layout: the radio and the name share one line at the top left (`body`, 600). The mark sits centred at 40px, with 8px of space around it. `meta` sits centred under it, in `body-sm` `ink-muted`.
- Tiles in a row share the same height. The grid is `minmax(200px, 1fr)`.
- The mark is always the official artwork in its official colours. Never recolour it, and never put it on a tinted ground.
- Some official marks are single-colour black (OpenAI, Anthropic, Ollama, OpenRouter, xAI, Groq, GitHub, Notion). These take `ink`, so they stay visible on dark.
- A disabled tile turns the mark grayscale at 60%. Its text turns `ink-disabled`.
- Fallback: when `mark` is not in `assets/brands` (a custom OpenAI-compatible endpoint, a self-hosted MCP server), the tile draws Tabler `server` at 40px in `ink-muted` in the same box. The grid never changes shape for an unknown brand.
- Keyboard: arrows move within the group and Space selects. Disabled tiles are skipped but stay visible.

## Tokens

`surface-100`, `surface-selected`, `border-strong`, `emerald-deep`, `ink`, `ink-muted`, `ink-disabled`, `radius-lg`, `press-scale`, `body`, `body-sm`.

## Mantine

`Radio.Group` of `Radio.Card radius="lg"` with `Radio.Indicator` at the top left. The mark is an inline SVG component from `@upmo-ai/brands`. Meta uses `Text size="sm" c="dimmed" ta="center"`.

## Marks

See `assets/brands/README.md` for the sources, the licences and the guideline link for each brand. A mark identifies the service the user connects to. It is not used anywhere else.
