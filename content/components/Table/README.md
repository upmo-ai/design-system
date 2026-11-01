# Table

Dense rows you can compare: the cost ledger, model lists, task events, knowledge documents.

## When to use

- Four or more columns of values that people compare. Objects with a title and a status are `Card` tiles instead.

## What the consumer provides

- Columns in priority order, each with a header label, an alignment and whether it sorts. Numbers use `num`: right-aligned and tabular. Give the table a `caption` or an `aria-label`.
- Rows. They can take `aria-selected` and a row action `Menu` in the last column.
- An unknown value shows the word "unknown" in `ink-muted`. Never a dash or a zero: Upmo shows costs honestly and never guesses.
- For phones, which column is the card title, which is the status, which two or three form the meta line, and which holds the row actions. In the HTML bundle these are `u-cell-title`, `u-cell-status`, `u-cell-meta` and `u-cell-actions` on the cells, with `u-table--stack` on the table.
- Which columns come after the first four by priority. In the HTML bundle these take `u-col-lg` on the `th` and on every `td`.

## Behaviour

- The table is `surface-000` inside a `border` container with `radius-sm` (4px). Above the table sits an optional toolbar with search and filter controls. Group headers span the table with bold section titles. Rows are in `body`, with `border` rules and sharp 2px checkboxes. Hover shows `surface-hover`. Selected rows show `surface-selected`.
- Sortable headers are buttons with `aria-sort`. The active sort shows a chevron.
- From `bp-sm`, the table shows primary columns. From `bp-lg`, it shows every column. Below its `min-width`, it scrolls sideways inside its container.
- Dense numeric columns use `u-num` with tabular numbers.
- Code-like values (model ids, hashes) use `code`.

## Tokens

`surface-000`, `surface-100`, `surface-hover`, `surface-selected`, `border`, `ink`, `ink-muted`, `radius-sm`, `radius-xs`.

## Mantine

`<Table.ScrollContainer minWidth={560}><Table stickyHeader highlightOnHover verticalSpacing="sm">` with `Table.Thead`, `Table.Th`, `Table.Tbody`, `Table.Td`. Below `bp-sm`, render the rows as a list of `Card`s instead (`hiddenFrom="sm"` and `visibleFrom="sm"`). Columns past the first four take `visibleFrom="lg"` on their `Table.Th` and `Table.Td`.
