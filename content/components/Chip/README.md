# Chip

A small toggle or token, such as a knowledge folder attached to a chat, a filter or an uploaded file.

## When to use

- Use it to pick several of many, where each chosen item should stay visible (folders, tags).
- Use it as a removable token for an attachment, or for a chosen value in a multi-select.
- Do not use it for status. That is a `Badge`.

## What the consumer provides

- `children`: a short label. Use the folder name for knowledge, with no `#` in front, and the file name for attachments.
- `checked` and `onChange` for toggles. `onRemove` puts the X `ActionIcon` inside, for tokens.
- An optional `icon-sm` on the left. Show the caret when checked if a visible check helps the group.

## Behaviour

- A 32px pill with `border-strong` on `surface-100`. When checked, it is `surface-selected` with an `emerald-deep` border and text, over 120ms. Press scales by `press-scale`.
- Chips wrap in rows with `space-2` gaps. Keyboard: Space toggles. Delete or Backspace removes a token.

## Tokens

`surface-100`, `border-strong`, `surface-selected`, `emerald-deep`, `surface-hover`, `ink-muted`, `radius-full`, `control-sm`.

## Mantine

`<Chip checked onChange variant="outline" size="sm" radius="xl" icon={<Caret/>}>`. For groups, use `Chip.Group multiple`. Removable tokens are `Pill` with `withRemoveButton`.
