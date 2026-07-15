# Pagination

Page controls for lists over 50 rows, such as the ledger, task events and knowledge documents.

## When to use

- Use it for tables and lists with a known total. Chat history uses infinite scroll instead.

## What the consumer provides

- `total`, `value`, `onChange`, and a "Showing a to b of n" line next to it in `body-sm`.
- A fixed page size per list (20 or 50). Offer a size switch only in tables.

## Behaviour

- 36px buttons, `radius-md`, tabular numbers. The current page fills with `emerald-deep`. Hover shows `surface-hover`. The first and last pages always show, with an ellipsis between.
- Previous and Next are icon buttons with labels. At the ends they are disabled, in `ink-disabled`.
- The page number is in the URL (`?page=3`), so it survives a reload and the back button.

## Tokens

`emerald-deep`, `ink-on-brand`, `surface-hover`, `ink`, `ink-muted`, `ink-disabled`, `radius-md`.

## Mantine

`<Pagination total value onChange siblings={1} boundaries={1} radius="md" />`.
