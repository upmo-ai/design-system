# TerminalStream

Live output from a task sandbox, as it happens: build logs, test runs, shell tool calls.

## When to use

- On the task detail page while a step runs. In the tool call drawer for `shell`. When an engine such as Claude Code or Codex does the work, the whole run is one stream.
- Finished output of a known size is a `CodeBlock`. A single short command result inside chat is a `CodeBlock` too.

## What the consumer provides

- `lines`: `{ at, text, level? }`, where `level` is `ok` | `warn` | `err` | `info` | `dim` | `cmd`. The component can also take raw ANSI, the escape codes terminals use for colour, and map it. Codes 30 to 37 and 90 to 97 collapse to the five colour levels, `ok` to `dim`. Bold is `cmd`. Everything else is ink. Never more than the five colours.
- `status` for the header badge: `Working` with the lift caret, `Done` with the done caret, `Failed` with the X. Each shows the elapsed time in tabular figures.
- `title` for the header, in `code-sm`: sandbox, task id, run number.
- Optional `maxLines` (default 5000). Older lines drop from the DOM, and a "Download full log" link appears in the header.

## Behaviour

- The ground is `surface-200` in all three themes, never a hard-coded black. It has a `border` and `radius-lg`. Text is Fira Code 13/20 in `ink`. A timestamp gutter in `ink-disabled` runs down the left, and it cannot be selected.
- Levels map to tokens: `ok` `emerald-deep`, `warn` `warning`, `err` `danger`, `info` `info`, `dim` `ink-muted`, `cmd` `ink` at weight 600. The words carry the meaning (PASS, FAIL, warning). The colour only repeats it, so the high-contrast theme and colour-blind readers lose nothing.
- The follow pill sits bottom right. It reads "Following" with the caret while the view sticks to the end. Scrolling up pauses it, and the pill then reads "Follow output" with a down chevron. Clicking it jumps to the end and resumes. Scrolling to the end by hand resumes too. The pill is `surface-100`, `border-strong`, `shadow-sm`, `radius-full`. While following, it uses `surface-selected` and `emerald-deep`.
- New lines appear with no animation, because they are content, not decoration. So reduced motion changes only the lift caret in the badge.
- The log is `role="log"` with `aria-live="polite"`. The pill's `aria-pressed` announces the follow state. With the keyboard, the body takes focus and scrolls with arrows, PageUp, PageDown, Home and End.
- Lines wrap (`pre-wrap`, long words break). The page never scrolls sideways. Copy copies the text only, without timestamps.

## Tokens

`surface-200`, `surface-100`, `surface-selected`, `border`, `border-strong`, `ink`, `ink-muted`, `ink-disabled`, `emerald`, `emerald-deep`, `warning`, `danger`, `info`, `shadow-sm`, `radius-lg`, `radius-full`, `code`, `code-sm`, `duration-lift`.

## Mantine

`ScrollArea` with `viewportRef` for the follow logic. `onScrollPositionChange` sets following when the viewport is within 8px of the end. The pill is a `Button size="compact-xs" radius="xl" variant="default"` with `aria-pressed`. The header is a `Group` with a `Badge` and `ActionIcon`s. ANSI parsing happens outside the component, which takes lines that already have a level.
