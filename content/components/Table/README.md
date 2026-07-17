# Table

Dense rows you can compare: the cost ledger, model lists, task events, knowledge documents.

## When to use

- Four or more columns of values that people compare. Objects with a title and a status are `Card` tiles instead.

## What the consumer provides

- Columns, each with a header label, an alignment and whether it sorts. Numbers use `num`: right-aligned and tabular. Give the table a `caption` or an `aria-label`.
- Rows. They can take `aria-selected` and a row action `Menu` in the last column.
- An unknown value shows the word "unknown" in `ink-muted`. Never a dash or a zero: Upmo shows costs honestly and never guesses.

## Behaviour

- The table is `surface-100` inside a `border` container with `radius-md`. The header is sticky, on `surface-200`, in `body-sm` weight 600 and `ink-muted`. Rows are 44px high, in `body`, with `border` rules. Hover shows `surface-hover`. Selected rows show `surface-selected`.
- Sortable headers are buttons with `aria-sort`. The active sort shows a chevron.
- Below its `min-width`, the table scrolls sideways inside its container. On phones, secondary columns hide behind a "More" disclosure, or the table turns into stacked cards.
- Code-like values (model ids, hashes) use `code`.

## Tokens

`surface-100`, `surface-200`, `surface-hover`, `surface-selected`, `border`, `ink`, `ink-muted`, `radius-md`.

## Mantine

`<Table.ScrollContainer minWidth={560}><Table stickyHeader highlightOnHover verticalSpacing="sm">` with `Table.Thead`, `Table.Th`, `Table.Tbody`, `Table.Td`.
