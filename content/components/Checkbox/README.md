# Checkbox

A box for picking several of a few options, or one yes/no that takes effect on submit, with the caret as its check mark.

## When to use

- Use it to pick tools, folders or days of the week. Use it for consent lines before a destructive action.
- Something that takes effect at once is a `Switch`.

## What the consumer provides

- `label` (required) and an optional `description` under it. `checked`, and `indeterminate` for a parent whose children are mixed.
- `error` for a required consent box. It shows under the group.

## Behaviour

- A 20px box with `border-strong` and `radius-xs`. When checked, it fills `emerald-deep` and the caret scales in over 160ms.
- The box scales to 0.92 while pressed. This is the small-control exception to `press-scale` (see Motion).
- The focus ring goes on the box, not the label. The whole label row is the click target, at least 40px tall.
- Disabled: a `surface-200` box and `ink-disabled` text. The description says why.

## Tokens

`surface-100`, `border-strong`, `emerald-deep`, `ink-on-brand`, `focus`, `danger`, `surface-200`, `ink-disabled`, `radius-xs`.

## Mantine

`<Checkbox label description icon={CaretCheckIcon} indeterminate error />`. For groups, use `Checkbox.Group`.
