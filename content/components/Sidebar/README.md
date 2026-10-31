# Sidebar

The app's main navigation: workspace switcher and collapse toggle on top, a quick action button, primary navigation, collapsible recent items with hover actions, and a user profile footer.

## When to use

- On every signed-in page. Marketing pages use a top nav instead.

## What the consumer provides

- Workspace header: wordmark or workspace name with switcher menu, and a collapse toggle button (⌘B).
- Quick action: primary "New task" button with keyboard shortcut hint (`⌘N`).
- Items: `{ label, icon, href, badge? }`. Core navigation includes Home, Tasks, Chat, Automations, Agents, Knowledge, and Settings.
- Recent items: list rows under a collapsible group header, with an inline "More" button on hover.
- Notifications are not a sidebar item. They live in the bell in the top bar of the app shell (see Patterns).
- `aria-current="page"` on the current item. Badges are counts (the `Badge` count variant), never dots.
- The footer holds the user profile card with avatar, name, workspace or team, and menu trigger.

## Behaviour

- From `bp-md` it is the full `sidebar` (248px) on `surface-200`. Between `bp-sm` and `bp-md` it is a 56px icon rail with tooltips. Below `bp-sm` it is a drawer that opens from the top bar and closes on route change. The Responsive section is the reference. Tab reaches every item. On the rail, each label is in a tooltip on hover and on focus.
- The sidebar uses compact density: items are 30px high and 2px apart with a precise pointer. Text is `body-sm`, with an `icon-sm` (16px), a `space-2` gap, and `radius-sm`. Hover shows `surface-hover`. The current item is `surface-selected`, with `emerald-deep` text and icon at weight 600. Group labels use `overline`.
- The sidebar remembers if the user collapsed it. With the keyboard, Tab moves through the items. On focus, the rail shows each label in a `Tooltip`.

## Tokens

`surface-200`, `surface-hover`, `surface-selected`, `emerald-deep`, `emerald`, `ink`, `ink-muted`, `body-sm`, `overline`, `radius-sm`, `radius-md`, `radius-lg`, `space-1`, `space-2`, `space-3`, `sidebar`, `control-sm`, `control-md`, `icon-sm`.

## Mantine

`AppShell` with `navbar={{ width: { sm: 56, md: 248 }, breakpoint: 'sm', collapsed: { mobile: !opened } }}`. This gives the rail at `sm`, the full width at `md` and a drawer below `sm`. Items are `NavLink` with `active`, `leftSection` and `rightSection`.
