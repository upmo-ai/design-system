# Skeleton

A shimmering placeholder in the shape of the content that is loading.

## When to use

- Lists, cards, tables and chat history while they load. Use it for anything with a known layout.
- A wait of unknown length (a model thinking) uses `Loader`.

## What the consumer provides

- A width and height per line that match the real text sizes: 14px lines for `body-sm`, 18px for `h4`. Use `circle` for avatars and `radius-full` for badges.
- A container with `aria-busy="true"` and an `aria-label` that names what is loading.

## Behaviour

- The shimmer moves from `surface-200` through `surface-100`. It makes one linear pass per `duration-shimmer` (1.8s). Under reduced motion it is plain `surface-200`.
- It appears after 300ms. The content then replaces it in place, and the layout does not jump.

## Tokens

`surface-200`, `surface-100`, `radius-xs`, `radius-full`.

## Mantine

`<Skeleton height={14} width="70%" radius="xs" />`, `<Skeleton circle height={32} />`.
