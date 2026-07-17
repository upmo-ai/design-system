# Avatar

A circle that stands for a person or an agent: initials for people, the caret for Upmo, an icon for custom agents.

## When to use

- Use it in chat replies (the 20px caret beside an assistant message), member lists, the task "run by" line and comment threads.

## What the consumer provides

- `name` (for the initials and the `aria-label`) or `src` for a photo. `kind`: `person` | `upmo` | `agent` with an icon.
- `size`: 24, 32 (default), 48. In a group, avatars overlap by 8px with a `surface-000` ring. The group ends in a "+n" count.

## Behaviour

- People get an `emerald-soft` ground with `emerald-deep` initials at weight 600. Agents get `surface-100` with a `border` and an `emerald` icon. Photos are cropped to the circle.
- Never show a generic silhouette. Show the initials or the kind's icon.

## Tokens

`emerald-soft`, `emerald-deep`, `emerald`, `surface-100`, `surface-200`, `border`, `ink-muted`, `radius-full`.

## Mantine

`<Avatar radius="xl" size={32} color="emerald" variant="light">MO</Avatar>`. For groups, use `Avatar.Group spacing="sm"`.
