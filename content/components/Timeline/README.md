# Timeline

Events in order down a line: a task's statuses and steps, an automation's runs, an audit trail.

## When to use

- Use it when the order is the information. Status without an order goes in a `Badge`. A count goes in `Progress`.

## What the consumer provides

- Items with a `title`, a `meta` line (time, duration, counts in `body-sm`), an optional body, and a state: `done | current | upcoming | failed`.
- When the timeline is a task, the titles are the status words Preparing, Planning, Working, Checking.

## Behaviour

- Dots are 24px on a 2px line. Done dots fill with `emerald-deep` and show the caret, and the line below them turns `emerald-deep`. The current dot has a 2px `emerald-deep` ring with the lift caret. Upcoming dots show their number in `ink-muted`. Failed dots are `danger`, with the X on `danger-soft`.
- New events appear with a 200ms fade. The list is a `role="list"`. For tasks the newest event is at the bottom. For audit logs it is at the top. Say which in the heading.

## Tokens

`border`, `border-strong`, `emerald-deep`, `ink-on-brand`, `danger`, `danger-soft`, `ink`, `ink-muted`, `ink-secondary`, `surface-100`.

## Mantine

`<Timeline active={2} bulletSize={24} lineWidth={2} color="emerald">` with `Timeline.Item bullet title`.
