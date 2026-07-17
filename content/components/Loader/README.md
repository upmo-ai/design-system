# Loader

The caret drawing itself, and the only loading indicator in Upmo.

## When to use

- Use `draw` for page and panel loads, for model waits and inside a loading `Button`.
- Use `lift` next to a status word while an agent works ("Thinking", "Working…").
- When you know the shape of the content, use `Skeleton` instead.

## What the consumer provides

- `variant`: `draw` (default) | `lift`. `size`: 16, 24 or 48. `color`: `emerald` by default, `currentColor` inside buttons.
- `aria-label` ("Loading") when it stands alone. `aria-hidden` when a word sits next to it.

## Behaviour

- `draw`: the left stroke draws, then the right, then it holds and fades. One loop takes `duration-loader` (1.6s), with `ease-standard`.
- `lift`: it rises 14% and settles once per `duration-lift` (4s). It rests for the other 80% of the cycle.
- Show it only after 300ms, so fast loads do not flash. Under reduced motion both variants show the static caret.
- It never spins and never changes colour in the middle of a loop. A calm loader tells people the agent is still working, not stuck.

## Tokens

`emerald`, `ink-on-brand` (inside filled buttons), `mist` (track when paired with `Progress`).

## Mantine

Register it as the theme loader: `theme.components.Loader = Loader.extend({ defaultProps: { loaders: { ...Loader.defaultLoaders, caret: CaretLoader }, type: 'caret' } })`. Every `loading` prop then uses it.
