# Sidebar

The app's main navigation: the wordmark on top, one item per section, workspace items below, and a footer with setup, theme and sign out.

## When to use

- On every signed-in page. Marketing pages use a top nav instead.

## What the consumer provides

- Items: `{ label, icon, href, badge? }`. The order is fixed: Home, Chat, Tasks, Automations, Agents, Knowledge, Usage. Then comes a "Workspace" `overline` group with Settings.
- Notifications are not a sidebar item. They live in the bell in the top bar of the app shell (see Patterns).
- `aria-current="page"` on the current item. Badges are counts (the `Badge` count variant), never dots.
- The footer holds a setup progress ring with "Setup 3 of 4", the theme switch, Sign out, and the version in `code-sm`.

## Behaviour

- From `bp-md` it is the full `sidebar` (248px) on `surface-200`. Between `bp-sm` and `bp-md` it is a 56px icon rail with tooltips. Below `bp-sm` it is a drawer that opens from the top bar and closes on route change. The Responsive section is the reference. Tab reaches every item. On the rail, each label is in a tooltip on hover and on focus.
- The sidebar pads `space-3`. With a precise pointer, items are `control-sm` (32px) high and `space-1` apart. On a coarse pointer they are `control-md` (40px) and `space-2` apart. Text stays `body-sm`, with an `icon-sm` (16px), a `space-2` gap, `space-2` horizontal padding and `radius-sm`. Hover, only under `(hover: hover)`, shows `surface-hover`. The current item is `surface-selected`, with `emerald-deep` text and icon at weight 600. Group labels stay `overline`.
- The sidebar remembers if the user collapsed it. With the keyboard, Tab moves through the items. On focus, the rail shows each label in a `Tooltip`.

## Tokens

`surface-200`, `surface-hover`, `surface-selected`, `emerald-deep`, `emerald`, `ink`, `ink-muted`, `body-sm`, `overline`, `radius-sm`, `radius-lg`, `space-1`, `space-2`, `space-3`, `sidebar`, `control-sm`, `control-md`, `icon-sm`.

## Mantine

`AppShell` with `navbar={{ width: { sm: 56, md: 248 }, breakpoint: 'sm', collapsed: { mobile: !opened } }}`. This gives the rail at `sm`, the full width at `md` and a drawer below `sm`. Items are `NavLink` with `active`, `leftSection` and `rightSection`.
