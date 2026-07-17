# Card

A bordered tile for one object, such as a task, an agent, an automation or a provider to pick.

## When to use

- Use cards for grids of objects that each have a title, a line of metadata and a status. Use selectable tiles for choices with a short description (providers, engines, plans).
- Dense rows that people compare are a `Table`. Prose sections are not cards.

## What the consumer provides

- `title` (`h4`) and `meta` (`body-sm` in `ink-muted`). Optional: a status `Badge` at the top right and a `StatusCaret` line. An actions row sits at the bottom right (`sm` buttons).
- `mode`: `static` | `clickable` | `selectable`.
- `clickable`: the whole card is one link. Buttons inside it stop propagation, so a click on them does not open the card.
- `selectable`: the card uses `aria-pressed`. The caret appears at the top right when it is selected.

## Behaviour

- `surface-100`, 1px `border`, `radius-lg`, `space-5` padding (`space-4` on phones). No shadow at rest.
- Clickable: hover shows `surface-hover` and `border-strong`. Press scales by `press-scale`. Focus shows the ring.
- Selectable: `border-strong` at rest. When selected, it gets an `emerald-deep` edge (1px plus an inner 1px), the `surface-selected` ground and the caret.
- Grid: `auto-fill, minmax(320px, 1fr)` with `space-5` gaps. The content sets the height. Cards in a row share edges.

## Tokens

`surface-100`, `border`, `border-strong`, `surface-hover`, `surface-selected`, `emerald-deep`, `ink`, `ink-muted`, `radius-lg`, `space-4`, `space-5`.

## Mantine

`<Card withBorder radius="lg" padding="lg">` with `Group justify="space-between"` for the head. A clickable card uses `component="a"`. A selectable card is an `UnstyledButton` with `aria-pressed` and `data-selected` styles.
