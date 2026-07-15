# Radio

One choice from two to five options, all visible, each with a short description.

## When to use

- Use it for choices people should compare: where a task runs, how a provider signs in, a billing plan.
- For six or more options, use `Select`. For short one-word options in a toolbar, use `SegmentedControl`.

## What the consumer provides

- A `fieldset` with a `legend` that asks the question ("Where should this run?").
- Options with a `label` and an optional `description`. When there is a sensible default, put the recommended option first and check it.
- An `error` under the group when nothing is chosen on submit.

## Behaviour

- Each option is a 20px circle with a `border-strong` edge. When checked, it becomes a 6px `emerald-deep` ring with a `surface-100` centre, in 120ms.
- Arrow keys move the choice inside the group. Tab leaves the group. The focus ring sits on the circle.
- Disabled options stay visible. The description says why they are off.

## Tokens

`surface-100`, `border-strong`, `emerald-deep`, `focus`, `danger`, `ink-disabled`, `radius-full`.

## Mantine

`<Radio.Group label error>` with `<Radio value label description />`. For large tile options, use `Card` in `select` mode instead.
