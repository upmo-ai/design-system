# DiffBlock

A unified diff for one file, shown wherever an agent proposes a change: approval cards, task step details, artifact history.

## When to use

- Use it for a `write_file`, `edit` or shell patch that needs approval. The diff is the thing you approve, so it sits above the Deny and Approve buttons.
- Use it to review what a finished step changed. Several files render as several blocks, each with its own header. Never put file separators inside one block.
- Do not use it for prose edits. Use a before and after `Prose` pair instead. Do not use it for whole new files over 200 lines. Show the first 40 lines and a "Open full file" link.

## What the consumer provides

- `path` for the header, in `code-sm`. `added` and `removed` counts for the header, in tabular figures (digits of equal width, so they line up).
- `hunks`: each with its `@@` header and lines `{ kind: 'context' | 'add' | 'del', oldNo?, newNo?, text }`. A hunk is one block of nearby changes.
- `folded`: unchanged runs over 8 lines collapse into a "Show n unchanged lines" button inside the hunk header.
- An optional approval footer: the note ("1 file · the agent waits until you decide"), then an outline Deny and a filled "Approve change".

## Behaviour

- The container is `CodeBlock`: `surface-200`, `border`, `radius-lg`, Fira Code 13/20. Two line-number columns (old, new) come first, in `ink-disabled`. Then a sign column, then the code. Numbers and signs are not selectable, so a copied selection holds code only.
- Added lines sit on `emerald-soft` with a `+` in `emerald-deep`. Removed lines sit on `danger-soft` with a `-` in `danger` and a faint strike-through. The ground is the hint and the sign is the meaning, so the diff still reads without colour. Screen readers hear "added" and "removed" from a visually hidden word in the sign cell.
- Long lines scroll inside the block. The page never scrolls sideways. Tabs render at 2.
- Whitespace-only changes keep the sign. The changed run gets a dotted underline.
- Keyboard: the block is a labelled region and the fold buttons are real buttons. The footer buttons follow the Modal order: the Cancel-like button first, the primary last.

## Tokens

`surface-200`, `surface-100`, `border`, `ink`, `ink-muted`, `ink-disabled`, `emerald-soft`, `emerald-deep`, `danger-soft`, `danger`, `warning` (approval badge), `radius-lg`, `code`, `code-sm`.

## Mantine

Mantine has no diff component. Build on `Code block` styles, with `ScrollArea` for the sideways overflow and `Button variant="subtle" size="compact-xs"` for the fold. Syntax colour inside the diff follows `CodeBlock`: keys `emerald-deep`, strings `warning`, numbers `info`, comments `ink-muted`. It applies under the add and remove grounds without change.
