# Progress

A thin bar for anything with a known fraction: budget, tokens, uploads, steps.

## When to use

- Use it when the value is a number out of a maximum. Task status uses `StatusCaret`. Waits of unknown length use `Loader`.

## What the consumer provides

- `value` from 0 to 100 and an `aria-label`. Put a visible number or word beside the bar (`caption`, tabular).
- `color`: `emerald-deep` by default. For budgets, switch to `warning` at 75% and to `danger` at 90%. Say so in the label too, so people see the warning before a task pauses.

## Behaviour

- The bar is 4px high with `radius-full`. The track is `mist`. The fill animates its width over 200ms.
- When complete, it shows "Done" in `success` beside the bar. A colour change alone is not enough.

## Tokens

`mist`, `emerald-deep`, `warning`, `danger`, `success`, `ink-muted`, `radius-full`.

## Mantine

`<Progress value={62} size={4} radius="xl" color="emerald" aria-label="Budget used" />` with a `Text size="xs"` beside it.
