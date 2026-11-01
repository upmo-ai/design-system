# Sidebar

The app's main navigation: clean icon + text links, active pill indicators, and a pinned bottom AI trigger (`Ask Upmo`). The top bar houses the brand mark, navigation collapse toggle, search bar (`⌘K`), and user profile popover.

## When to use

- On every signed-in page. Marketing pages use a top nav instead.

## What the consumer provides

- Items: `{ label, icon, href, badge? }`. Core navigation includes Home, Tasks, Chat, Automations, Agents, Knowledge.
- Pinned bottom action: `Ask Upmo` with an AI sparkle icon.
- `aria-current="page"` on the current item. Badges are counts (the `Badge` count variant).
- The top bar holds the user profile avatar, which triggers the user popover menu (Avatar, Name, Email, Settings, Security, Documentation, and Sign out).

## Behaviour

- From `bp-md` it is the full sidebar (220px) on `surface-000` with subtle border. Between `bp-sm` and `bp-md` it is a 56px icon rail with tooltips. Below `bp-sm` it is a drawer that opens from the top bar.
- Items are 32px high with an icon (16px), a `space-2` gap, and `radius-sm` (4px). Hover shows `surface-hover`. The current item is `surface-hover` with weight 600.
- With the keyboard, Tab moves through the items. On focus, the rail shows each label in a `Tooltip`.

## Tokens

`surface-000`, `surface-hover`, `surface-selected`, `emerald-deep`, `emerald`, `ink`, `ink-muted`, `body-sm`, `radius-xs`, `radius-sm`, `space-1`, `space-2`, `space-3`.

## Mantine

`AppShell` with `navbar={{ width: { sm: 56, md: 248 }, breakpoint: 'sm', collapsed: { mobile: !opened } }}`. This gives the rail at `sm`, the full width at `md` and a drawer below `sm`. Items are `NavLink` with `active`, `leftSection` and `rightSection`.
