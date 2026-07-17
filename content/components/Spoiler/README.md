# Spoiler

Long text cut to a few lines with a "Show more" link, so lists and cards stay easy to scan.

## When to use

- Task descriptions in cards, long tool outputs in a timeline, previews of knowledge chunks.
- Not for instructions people must read. Show those in full.

## What the consumer provides

- `maxHeight` (by default three lines of `body`, 66px), the content, and the labels "Show more" / "Show less".

## Behaviour

- Cut-off content fades into the ground over the last 32px. The button is `emerald-deep`, weight 600, in `body-sm`. Its `aria-expanded` is wired to the body. It expands over 200ms. If the content fits, no button renders.

## Tokens

`ink-secondary`, `emerald-deep`, `emerald-hover`, `surface-000` (the fade), `measure`.

## Mantine

`<Spoiler maxHeight={66} showLabel="Show more" hideLabel="Show less" transitionDuration={200}>`.
