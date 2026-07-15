# Slider

A value you pick by dragging, smooth or in steps, with the number always visible.

## When to use

- Temperature, budget caps, retention days: values where a feel for the range matters more than typing. On desktop, exact values also get a `TextInput` beside the slider.

## What the consumer provides

- `label`, `min`, `max`, `step`, `value` and `onChange`. A `format` for the value bubble ("€120", "0.7"). Up to three marks, with words at the ends ("precise", "creative").
- `aria-valuetext` with the formatted value.

## Behaviour

- The track is 4px `mist` with an `emerald-deep` fill. The thumb is 20px: `surface-100` with a 2px `emerald-deep` ring. It grows 10% on hover and focus. The value bubble sits on `surface-inverse` and follows the thumb.
- Arrow keys move one step. Shift+Arrow moves by 10. Home and End jump to the ends. The touch target is the full 40px row.

## Tokens

`mist`, `emerald-deep`, `surface-100`, `surface-inverse`, `ink-inverse`, `ink-muted`, `focus`, `radius-full`.

## Mantine

`<Slider min max step value onChange label={fmt} marks thumbSize={20} />`. Use `RangeSlider` for spans.
