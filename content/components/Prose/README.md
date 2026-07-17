# Prose

Typography for rendered Markdown: chat replies, task results, knowledge documents, docs.

## When to use

- Use it for any block of text that the agent or a document author wrote. UI copy (labels, descriptions) uses the type styles directly, not Prose.

## What the consumer provides

- Rendered HTML inside one `.prose` container. Inside a reply, headings start at `h2`, because the page owns `h1`.

## Behaviour

- Body text is `body` in `ink-secondary` at `measure` (68ch). Blocks sit 12px apart, with 24px above headings. Headings are `h2` to `h3` in `ink`.
- Links are `emerald-deep`, underlined, with a 2px offset. Inline code is `code` on `surface-200`. Block quotes have a 2px `emerald` rule on the left and `ink-muted` text. Tables follow the `Table` rules at `body-sm`. List markers stay `ink-muted`.
- Images fit inside the container, with `radius-md` and a caption in `caption`. Code fences become a `CodeBlock`.
- Never justify text. Never use drop caps. Never use more than one typeface.

## Tokens

`ink`, `ink-secondary`, `ink-muted`, `emerald`, `emerald-deep`, `emerald-hover`, `surface-200`, `border`, `measure`, `radius-xs`, `radius-md`.

## Mantine

`<Typography>` with these rules in `theme.components.Typography.styles`, or a `.prose` class on the Markdown root.
