# EmptyState

What a list or page shows before it has anything: the name of the thing, one line on how to add it, and the button that adds it.

## When to use

- Use it for first-run lists (tasks, agents, automations, chats). Also use it for a filter with no matches and a search with no results.

## What the consumer provides

- `icon`: a Tabler icon at `icon-lg` on the `emerald-soft` tile. For first-run, use the caret.
- `title` (`h3`): "No tasks yet", "No matches". `description` (`body`, max 40ch): what the thing is and how to add it.
- One primary `Button`. For a filter, use a `subtle` "Clear filters" instead.

## Behaviour

- Centred, with `space-12` padding above and below and `space-6` at the sides. On first-run, a dashed `border-strong` outline marks the empty area. Results with no match have no outline.
- Never a sad face, an illustration or an apology. An empty list is a normal start, not an error.

## Tokens

`emerald-soft`, `emerald-deep`, `ink`, `ink-muted`, `border-strong`, `radius-lg`, `space-12`.

## Mantine

Composition: `<Stack align="center" gap="xs" py={48}>` with `ThemeIcon variant="light" size={48} radius="lg"`, `Title order={3}`, `Text c="dimmed" maw={320} ta="center"`, `Button`.
