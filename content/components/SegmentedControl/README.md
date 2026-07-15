# SegmentedControl

Two to five short options of equal weight, side by side, with one always selected.

## When to use

- Filters in a toolbar (All / Working / Done), view switches (List / Grid) and the theme choice.
- For options with descriptions, use `Radio`. For more than five, use `Select`.

## What the consumer provides

- `data`: short labels of one or two words each, or icons with an `aria-label`.
- `value` and `onChange`, and an `aria-label` for the group.

## Behaviour

- The track is `surface-200` with `radius-md`. The selected segment is a `surface-100` pill with `shadow-sm`. It slides into place in 120ms.
- Arrow keys move the selection. The whole control is one Tab stop.
- On phones it takes the full width, and the segments stay equal.

## Tokens

`surface-200`, `surface-100`, `shadow-sm`, `ink`, `ink-muted`, `radius-md`, `radius-sm`, `control-sm`.

## Mantine

`<SegmentedControl data value onChange radius="md" size="sm" fullWidth={isPhone} />`.
