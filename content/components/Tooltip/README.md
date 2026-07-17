# Tooltip

A short label that appears on hover and focus, to name an icon-only control or spell out an abbreviation.

## When to use

- Every `ActionIcon` and every other icon-only control. This happens automatically from its `aria-label`.
- Every rail item, cut-off numbers (the token counts), and disabled controls, to say why they are off.
- Never for information the user needs to finish a task. Put that on the page.

## What the consumer provides

- `label`: up to about 40 characters, with no punctuation at the end. For a disabled control, the reason.
- A trigger that can take focus. A plain `span` gets `tabindex="0"`.

## Behaviour

- It is `surface-inverse` with `ink-inverse`, `caption` text, `radius-md` and `shadow-sm`. It sits 8px above the trigger and flips below when there is no room.
- On hover it opens after 400ms. On focus it opens at once. It closes on blur, on mouse leave or on Escape. On touch it never opens on a tap alone, so the label must exist another way there.
- It has `role="tooltip"`, linked through `aria-describedby`.

## Tokens

`surface-inverse`, `ink-inverse`, `shadow-sm`, `radius-md`, `z-dropdown`.

## Mantine

`<Tooltip label openDelay={400} radius="md" withArrow={false}>`.
