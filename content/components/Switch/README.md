# Switch

An on/off setting that takes effect the moment it flips.

## When to use

- Settings pages, turning an automation on or off, notification preferences.
- If the change needs a Save button, use a `Checkbox`.

## What the consumer provides

- A `label` that names the thing being turned on ("Run on schedule"). `checked`, and an `onChange` that saves at once.
- An optional state word beside it ("On" / "Off"), so people read the state as text, not colour.
- `disabled`, with a label that says why ("Always on").

## Behaviour

- The track is 40 x 24: `border-strong` when off, `emerald-deep` when on. The 18px knob slides 16px in 200ms. It stretches while pressed.
- It saves on change and shows a small `success` caret with "Saved" for 2s. If saving fails, it flips back. A `Notification` in `danger` then says what happened.
- Space toggles it. The focus ring goes around the track.

## Tokens

`border-strong`, `emerald-deep`, `surface-100` (knob), `focus`, `border` (disabled), `ink-muted` (state word), `radius-full`.

## Mantine

`<Switch label onLabel="On" offLabel="Off" size="md" />`. Mantine `md` is 40 x 24 once the theme's `Switch` sizes are set.
