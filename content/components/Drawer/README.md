# Drawer

A panel that slides in from the right so you can inspect one thing without leaving the page: a tool call, a task event, a knowledge chunk, a long form.

## When to use

- Use it for detail you read next to the list it came from. Decisions and short forms go in a `Modal`. A drawer never asks a yes or no question.

## What the consumer provides

- `title` (`h3` size), the body content, and optional footer actions. Footer actions are `subtle` and `outline`. Add a `filled` primary only when the drawer holds a form.
- `size`: 420 by default, 560 for forms, full width below `bp-xs`.

## Behaviour

- `surface-100`, `shadow-lg`, left corners `radius-xl`, over `overlay`. It slides in over 240ms and out over 160ms.
- It traps focus, so Tab stays inside. Escape and the scrim (the dark layer behind) close it. Focus then returns to the control that opened it. The URL holds the selected item, so a reload opens it again.
- The body scrolls. The head and footer stay in place.

## Tokens

`surface-100`, `overlay`, `shadow-lg`, `radius-xl`, `border`, `ink`, `ink-muted`, `z-overlay`, `z-modal`.

## Mantine

`<Drawer position="right" size={420} opened onClose title overlayProps={{ backgroundOpacity: 0.48 }}>`.
