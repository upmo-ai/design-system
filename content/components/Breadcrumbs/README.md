# Breadcrumbs

The path to the current page, shown when the page sits more than one level below a sidebar item.

## When to use

- Use them on task run pages, agent detail and settings sub-pages. Do not use them on top-level pages. The sidebar already says where you are.

## What the consumer provides

- Items `{ label, href }`. The last item is the current page, as plain text with `aria-current="page"`.
- Labels are the objects' own names. Cut them at 32 characters and put the full name in `title`.

## Behaviour

- Links are `body-sm` in `ink-muted`, with a `/` separator. Hover shows `ink` on `surface-hover`. The current page is `ink` at weight 600.
- Below `bp-xs` only the parent shows, as "‹ Daily finance digest".

## Tokens

`ink-muted`, `ink`, `surface-hover`, `radius-sm`.

## Mantine

`<Breadcrumbs separator="/" separatorMargin={6}>` with `Anchor` items and a `Text` as the last item.
