# CodeBlock

Code of more than one line in Fira Code, such as tool call arguments, config snippets, SQL the agent ran or install commands.

## When to use

- Use it for any code longer than one line. Inline identifiers use the `code` style from `Kbd`.

## What the consumer provides

- `code` and `language`. The header shows the language mark and the language name in words: "Go", "TypeScript", "Bash", "SQL". An optional `fileName` follows the name.
- `copy` (on by default). `lineNumbers` for more than five lines. Optional `highlightLines`.

## Behaviour

- `surface-200` with `border` and `radius-lg`. The header is 36px. It holds the language mark at 16px, the language name in `ink-secondary`, and a `subtle sm` Copy button that reads "Copied" for 2 s. The Copy button points to the language name with `aria-describedby`, so a screen reader hears which block it copies.
- The language mark comes from `@upmo-ai/brands` (`languages`, files in `assets/languages`). It is `aria-hidden` and always sits next to the language name. It is never shown alone, and never anywhere else on the page. This is the one place outside pickers and connector rows where a third-party mark may appear.
- A language with no mark (Java, SQL, plain text, diff and any other) shows the Tabler `file-code` outline icon in `currentColor` in the same 16px slot. JSON shows the Tabler `braces` icon, the `{ }` people know. The header keeps the same shape for every language.
- Marks with a black published colour (Markdown, Rust) draw in `currentColor`, so they follow the theme. See the Languages page for the rules.
- Long lines scroll sideways inside the block. Code never wraps. Line numbers are `ink-disabled` and cannot be selected.
- There are four token colours only. Keywords are `emerald-deep`, strings `warning`, numbers `info`, and comments `ink-muted` italic. All of them meet 4.5:1 on `surface-200` in both themes.

## Tokens

`surface-200`, `border`, `radius-lg`, `ink`, `ink-secondary`, `ink-muted`, `ink-disabled`, `emerald-deep`, `warning`, `info`.

## Mantine

`@mantine/code-highlight`: `<CodeHighlight code language withCopyButton={false} radius="lg" />` under a header you render yourself (mark, name, Copy). Use a Shiki or highlight.js adapter mapped to the four token colours.
