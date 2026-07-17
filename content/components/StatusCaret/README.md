# StatusCaret

The caret as a progress indicator: one mark that shows where a task or automation is.

Upmo adds this on purpose, because Mantine has no equivalent. People leave agents running for hours, so one glance at the caret should tell them the status.

## When to use

- Task cards, task headers, the automations list, the notifications list. Use it anywhere a long-running thing has a status.
- Number fractions use `Progress`.

## What the consumer provides

- `status`: `queued | preparing | planning | working | checking | done | failed`. The words are Queued, Preparing, Planning, Working, Checking, Done and Failed.
- The status word next to it, always. The component renders the SVG with `aria-hidden`, so the word carries the meaning.
- `size`: 16 (in badges and rows) or 24 (in headers).

## Behaviour

- Queued (waiting for a free slot): both strokes `mist`. Preparing and Planning: left stroke `ink`. Working and Checking: both strokes `ink`. Done: both `emerald`. Failed: an X in `danger`.
- Each stroke change is a 200ms stroke-colour transition. A working task lifts 2px every 4s. The lift is off under reduced motion.
- Needs approval keeps the current caret and adds a `warning` `Badge` beside it.

## Tokens

`mist`, `ink`, `emerald`, `danger`, `success`, `warning`.

## Mantine

A custom `CaretStatus` component: one SVG, two paths, with `stroke` from CSS variables. It is used inside `Badge leftSection`.
