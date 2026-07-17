# Popover

A small panel attached to a control, holding one or two fields or a short piece of detail.

## When to use

- Use it for inline settings (budget, model override), a date picker, or a short explanation with a link. Anything bigger is a `Drawer`. A yes or no question is a `Modal`. A label is a `Tooltip`.

## What the consumer provides

- A trigger with `aria-haspopup` and `aria-expanded`. A title and content. For forms, a `sm` Cancel and Save row.
- `width`: 300 by default, up to 400.

## Behaviour

- `surface-100`, `border`, `shadow-sm`, `radius-lg`, 8px from the trigger. It flips to the other side when there is no room. It fades in over 200ms.
- It opens on click, and focus moves to the first field. Escape, a click outside or Save closes it and returns focus. Saving confirms inline or with a `Notification`.

## Tokens

`surface-100`, `border`, `shadow-sm`, `radius-lg`, `space-4`, `z-dropdown`.

## Mantine

`<Popover width={300} position="bottom-start" shadow="sm" radius="lg" trapFocus>` with `Popover.Target` and `Popover.Dropdown`.
