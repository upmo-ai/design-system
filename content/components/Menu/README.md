# Menu

A dropdown of secondary actions for one object, opened from a "More" `ActionIcon` or a `Button` with a chevron.

## When to use

- Use it for three or more secondary actions on a card, a table row or a page header.
- Do not use it to choose a value (use `Select`). Do not use it to navigate (use the sidebar or `Tabs`).

## What the consumer provides

- A trigger with `aria-haspopup="menu"` and `aria-expanded`.
- Items are `Menu.Item`, each with a verb label. An optional `icon-sm` Tabler icon goes on the left, and an optional `Kbd` shortcut on the right.
- Optional `Menu.Label` groups and `Menu.Divider`. Destructive items use `color="danger"`. They sit last, after a divider.

## Behaviour

- It opens on click with a 240ms fade and a 4px rise. It closes on Escape, an outside click or an item choice. Focus then goes back to the trigger.
- Arrow keys move, and Home and End jump to the ends. Typing a letter jumps to the matching item.
- A disabled item stays visible in `ink-disabled`, with a tooltip that says why.

## Tokens

`surface-100`, `border`, `shadow-sm`, `radius-md` (panel), `radius-sm` (items), `surface-hover`, `danger`, `danger-soft`, `ink-muted` (labels), `z-dropdown`.

## Mantine

`<Menu shadow="sm" radius="md" width={200} position="bottom-end">` with `Menu.Target`, `Menu.Dropdown`, `Menu.Label`, `Menu.Item leftSection rightSection`, `Menu.Divider`.
