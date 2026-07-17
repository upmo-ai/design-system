# Badge

A small pill that states a status or a category in a word, with its icon.

## When to use

- Use it for task and automation status on cards and in tables. Use it for engine tags, and for unread counts in the sidebar, tabs and the notifications bell.
- Tags that people can click are a `Chip`.

## What the consumer provides

- `children`: one or two words in sentence case. Status badges carry the status icon in `leftSection` at 14px: idle or working caret, warning clock, done caret, failed X, info circle.
- `variant`: `default` (`surface-200`) | `success` | `warning` | `danger` | `info` | `outline` (tags) | `count` (numbers on `emerald-deep`) | `plain`.
- `plain` shows the 14px status icon in the status colour before the word, with no ground. Use it in dense tables and lists, where a tinted pill on every row is too loud.
- There is no dot variant. A dot has no shape. Under protan vision (a form of red-green colour blindness) on dark, the done and failed dots are the same colour (see Contrast).

## Behaviour

- 24px high, `radius-full`, `label` text. A badge is not clickable. A clickable badge is a `Chip` or a `Button sm`.
- The colour never carries the meaning alone. The word and the icon do, so a person can tell a failed task from a done one at a glance.

## Tokens

`surface-200`, `success-soft`/`success`, `warning-soft`/`warning`, `danger-soft`/`danger`, `info-soft`/`info`, `border-strong`, `emerald-deep`, `ink-on-brand`, `radius-full`.

## Mantine

`<Badge variant="light" color="warning" radius="xl" leftSection={<IconClock size={14}/>}>Needs approval</Badge>`. For counts, use `variant="filled" circle`.
