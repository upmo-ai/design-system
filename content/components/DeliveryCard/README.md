# DeliveryCard

The Delivery card on a task page: where the task's result goes, and whether it got there.

## When to use

- Use it in the side column of a task (`PageTaskDetail`), after Budget. Every task has the card, also when nothing is sent anywhere.
- A delivery target is set on the task or on its automation. This card shows it and its state. It does not set up a new connector. "Change" and "Add" open the task's delivery setting.

## What the consumer provides

- `targets`: `{ id, service, mark?, name, state, time?, reason? }[]`, one per target. `name` is where it goes, such as `#finance` or `finance@acme.example`. `service` is the connector's name, such as Slack or Gmail.
- `state`: `waiting | sending | delivered | failed`.
- `onChange`, `onRetry` and `onAdd`.

## Behaviour

- The title is "Delivery" (`delivery.title`). Each target is one row: the 20px brand mark, the target and service ("#finance on Slack", `delivery.target`), and its state under it.
- A target with a service mark (Slack, Gmail) shows the mark from `assets/brands`, always next to the service's name, as the brand rules require. A target with no mark draws Tabler `send` in `ink-muted` in the same 20px box.
- The states:

| State | Row content |
| --- | --- |
| Waiting, task not done | "After the task is done" (`delivery.after_done`) under the target, with a "Change" `subtle sm` button (`delivery.change`) |
| Sending | A "Sending" `Badge` (`delivery.sending`) with the draw caret |
| Delivered | A "Delivered 08:06" `success` `Badge` (`delivery.delivered`) with the done caret and the time |
| Failed | A "Failed" `danger` `Badge` (`delivery.failed`), a short reason after it, and a "Try again" `outline sm` button (`action.retry`) |
| No target | "Results stay in Upmo" (`delivery.none`) with an "Add" link (`delivery.add`) |

- The badge shows the state word only. A Failed row adds a short reason, as a Failed status line does: "Slack key rejected". The reason is not a count.
- A task with several targets lists one row per target, each with its own state. One target can fail while another is delivered.

## Accessibility

- The rows are a list. Brand marks are `aria-hidden`, and the service name is in the text.
- "Change" and "Try again" point to the target name with `aria-describedby`, so a screen reader hears which target they act on.
- The "Add" link has the accessible name "Add delivery target" (`delivery.add_label`). It starts with the visible word.

## Tokens

`surface-100`, `border`, `radius-lg`, `ink`, `ink-muted`, `emerald-deep`, `success`, `success-soft`, `danger`, `danger-soft`, `surface-200`.

## Mantine

`Card withBorder radius="lg"` with a `Stack` of rows. Each row is a `Group wrap="nowrap"` with the brand mark from `@upmo-ai/brands`, a `Text` pair and a `Badge` or `Button variant="subtle" size="xs"`.
