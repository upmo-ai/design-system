# Divider

A 1px rule that separates groups: form sections, menu groups, chat days, and metadata values in a line.

## When to use

- Use it when spacing alone does not separate two groups clearly. Try `space-6` first. Add a divider only if the groups still read as one.

## What the consumer provides

- The orientation. An optional label in `overline` ("Today", "Archived") for day groups in a list.

## Behaviour

- `border` colour, 1px, with no margin of its own. The layout `gap` places it. Vertical dividers stretch to the height of the row.
- A labelled divider is `role="separator"`, with the label as its `aria-label`.

## Tokens

`border`, `ink-muted`.

## Mantine

`<Divider />`, `<Divider label="Today" labelPosition="center" />`, `<Divider orientation="vertical" />`.
