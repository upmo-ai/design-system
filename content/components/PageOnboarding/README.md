# PageOnboarding

A showcase of the first run, with a centred 640px column, no sidebar, a four-step `Stepper` (Instance, Provider, Sandbox, First task), selectable provider tiles, one field and one primary action.

## What it demonstrates

- The wordmark sits top left and "Setup · about 5 minutes" top right. Nothing else competes for attention.
- The `Stepper` header shows a done step, the current step with a ring, and upcoming steps with their numbers.
- The step title is an `h2` question. One line of `ink-secondary` text explains it. Below are selectable `Card` tiles. Picking a tile changes the field's label.
- A secret `TextInput` with a reveal button. Its description says where the key comes from, and that it is stored by reference.
- An `info` `Alert` offers a way out ("Skip for now"). Nobody gets stuck because they have no key yet.
- Actions: Back is `subtle`, on the left. Skip (`subtle`) and the `lg` `filled` primary "Test and continue" sit on the right. The primary tests the key with the draw caret before it moves on.

## Responsive

Below `bp-xs`, the tiles stack. The stepper collapses to "Step 2 of 4 · Provider" with the thin bar. The action row stacks, with the primary on top.
