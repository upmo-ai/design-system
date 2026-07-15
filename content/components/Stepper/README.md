# Stepper

A long form split into three to five named steps, each validated before the next.

## When to use

- Use it when a form has more than about seven fields, or when later fields depend on earlier answers. Examples: connecting a provider, creating an automation, onboarding.
- Keep short forms on one screen.

## What the consumer provides

- `steps`: `{ label, content, validate }[]`. Labels are short nouns ("Provider", "Credentials", "Model", "Review").
- `active`, `onStepChange`. The last step is a review that lists every answer with an Edit link.
- The action row has "Back" (`subtle`, hidden on the first step) and the primary button. The primary reads "Continue" until the last step. There it names the outcome ("Connect provider").

## Behaviour

- In the header, done steps show the caret on `emerald-deep`. The current step has a 2px `emerald-deep` ring. Upcoming steps are a `border-strong` circle in `ink-muted`. The connectors, the lines between steps, turn `emerald-deep` as steps complete.
- Done steps are buttons, and clicking one goes back to it. Upcoming steps are not clickable.
- "Continue" stays enabled. On an invalid step, pressing it shows the errors and moves focus to the first one. Each step change announces "Step 2 of 4, Credentials".
- "Back" keeps every value. Closing the stepper asks first only when something was entered.
- A step change moves the content. The old step fades out and moves 8px back. The new step fades in from 8px ahead: from the right going forward, from the left going back. The height follows, so the buttons do not jump. The ring, the connector fill and the compact bar animate too. Focus moves to the new step's heading. Under reduced motion, only a short fade is left.
- Below `bp-xs`, the header collapses to "Step n of m · Label" with a 4px `Progress` bar.

## Tokens

`emerald-deep`, `ink-on-brand`, `border-strong`, `border`, `surface-100`, `ink`, `ink-muted`, `surface-hover`, `radius-full`, `space-6`, and for the step change `space-2`, `duration-enter`, `duration-leave`, `duration-base`, `duration-fast`, `ease-standard`.

## Mantine

`<Stepper active onStepClick allowNextStepsSelect={false} completedIcon={<Caret/>} size="sm">` with `Stepper.Step label` and `Stepper.Completed`. Combine it with `useForm`, and validate the step's fields in `onStepClick`.

The step change uses `.u-step-body` on `classNames.content` and the `.u-step-panel`, `--enter`, `--leave` and `--back` classes from the Upmo stylesheet. Keep the outgoing step mounted for one `duration-leave`, and pin the content height while the panels swap.

The provider step is a `BrandTile` radiogroup, not chips.
