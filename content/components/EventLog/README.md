# EventLog

Every event of one run, as a log: one row per event, in plain words, oldest at the top.

## When to use

- Use it in the Activity tab of a task, under the "All events" view of the `SegmentedControl`. The "Summary" view is the task `Timeline`, which shows only the status steps.
- Use it when people need the full record of a run: to see why a run took long, what a model turn did, or when a result was sent. For the big picture, use the `Timeline`.

## What the consumer provides

- `events`: `{ id, time, kind, phase, message, type, details? }[]`, oldest first.
  - `time` shows in the code face, 24-hour with seconds: "08:01:15".
  - `kind` picks the small icon. It uses the icon map: task start `player-play`, files `files`, plan `list-details`, step `hammer`, model turn `cpu`, artifact `file`, approval `clock`, approved `user-check`, email `mail`, checking `shield-check`, checks `checklist`, done `flag`, delivered `send`, memory `brain`, notification `bell`.
  - `phase` is the status word of the step the event happened in: Preparing, Planning, Working, Checking or Done.
  - `message` is the event in plain words. Write it as Microcopy does: "Plan written: 4 steps", "Sent to #finance on Slack". An event message may carry a count, such as "4 of 4 checks passed". The no-count rule is for status lines, not for event messages.
  - `type` is the raw event name, such as `task.delivered`. Raw names always start with `task.`.
  - `details` is optional. A row with details can expand.
- `live`: true while the run is going. Only a live log has the follow live toggle.

## Behaviour

- **Toolbar** above the rows, on `surface-200`: the event count ("14 events", `count.events`), then icon buttons for follow live, jump to top, jump to bottom, copy log and full screen. Each is an `ActionIcon` with an `aria-label` and the same text as its tooltip. The tooltips open below the buttons, because the toolbar sits at the top of the log.
- **Rows**: the time in `font-mono`, the kind icon in `ink-muted`, the phase word in `ink-secondary` and the message in `ink`. Text uses text tokens only, never chart series colours. The phase word is the same word as the status, but it is plain text here, with no badge and no caret.
- **Expandable rows**: a row with details is a button with `aria-expanded` and a chevron that turns when it opens. The detail sits under the message. Every detail ends with the raw event type in the code face, under the label "Event type", for developers.
  - A model turn shows the engine, the model, the duration and the list of tool calls, each with its duration.
  - A plan shows its steps. Checks show each check. An approval shows what it asked for. A delivery shows the target.
- **The raw event name is never the visible message.** `task.model_turn` is only ever in the detail. Raw names use the glossary words, so they always start with `task.`.
- **Follow live** (`aria-pressed`) keeps the newest event in view while the run is going. It is on by default. Scrolling up, or Jump to top, turns it off. Press it again to follow. Next to the count, "Following live" or "Not following" says the state on wider screens. A finished run has no new events, so the toggle is not shown.
- **Jump to top** and **Jump to bottom** scroll the log, not the page.
- **Copy log** copies every row as plain text: time, phase and message. The label reads "Copied" for 2 s, and a status region says it to screen readers.
- **Full screen** shows the log over the whole window. The button label becomes "Exit full screen". Escape also closes it, and focus goes back to the button.
- The log scrolls inside its own box. Its height is set by the page. The task page uses 360px.
- Below `bp-sm` the phase word moves under the message, and the detail labels sit above their values.

## Accessibility

- The scrolling box has `role="log"` and an `aria-label`. It has `aria-live="polite"` only while following live. Otherwise it has `aria-live="off"`, because `role="log"` alone would still announce new rows.
- The box takes focus (`tabindex="0"`), so keyboard users can scroll it with the arrow keys.
- Icons are `aria-hidden`. The phase and the message are words, so nothing depends on the icon.
- A row button reads as one line: "08:00:16 Planning Plan written: 4 steps, collapsed".

## Tokens

`surface-100`, `surface-200`, `surface-hover`, `border`, `radius-lg`, `ink`, `ink-secondary`, `ink-muted`, `font-mono`, `z-modal`, `focus`.

## Mantine

Composition: `Paper withBorder radius="lg"` for the frame, a `Group` toolbar of `ActionIcon variant="subtle" size="md"` inside `Tooltip`, and a `ScrollArea` holding an `ol`. Each expandable row is an `UnstyledButton` with a `Collapse` under it. Full screen can use `Modal fullScreen`, which already returns focus on close.
