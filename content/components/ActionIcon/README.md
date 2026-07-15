# ActionIcon

An icon-only button for a small action that everyone knows, such as send, copy, close or more.

## When to use

- Use it in toolbars, table rows, the chat composer and the modal close button. Use it where a text label would only repeat the icon and a `Tooltip` can name it.
- Do not use it for the main action of a page. Use a `Button` with a label. The composer's send caret is the one exception.

## What the consumer provides

- `aria-label`: required. It is the verb, such as "Send message" or "Copy reply". Pair it with a `Tooltip` that shows the same text.
- `icon`: a Tabler icon at `icon-md` (`icon-sm` in the `sm` size). Use the caret for send and done.
- `variant`: `subtle` (default) | `light` | `outline` | `filled`. `size`: `sm` (32) | `md` (40).
- A toggle sets `aria-pressed`. The pressed state uses `surface-selected` and `emerald-deep`.

## Behaviour

- Hover shows `surface-hover`. Press scales by `press-scale`. Focus shows the `focus` ring. A disabled icon keeps its `aria-label` and gets a tooltip that says why.
- The touch target stays 40px, even at the 32px size. Transparent padding adds the extra space.

## Tokens

`surface-hover`, `surface-selected`, `emerald-deep`, `emerald-soft`, `ink-on-brand`, `border-strong`, `ink-disabled`, `radius-md`, `radius-sm`, `control-sm`, `control-md`.

## Mantine

`<ActionIcon variant="subtle" size="lg" aria-label="…">` (Mantine `lg` is 40px). Put `<Tooltip label="…">` around it.

## Don't

- An icon nobody recognises. If people have to guess, use a `Button` with text.
- Red icons for destructive actions outside a `Menu`. Put destructive actions behind "More".
