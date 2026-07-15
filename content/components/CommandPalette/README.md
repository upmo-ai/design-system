# CommandPalette

The ⌘K launcher: one field that searches pages, actions, recent objects and knowledge.

## When to use

- It works everywhere in the app. ⌘K / Ctrl+K opens it, and so does the search-shaped button in the top bar.
- It is the fastest route for keyboard users. For everyone else, it is where they discover what the app can do.

## What the consumer provides

- Sources of items: actions (with their shortcut), pages, recent tasks and chats, and knowledge documents.
- Each item has a Tabler icon, a title and a meta text on the right ("Go to", "Task · run 14").
- A fallback when nothing matches: "Press Enter to search knowledge for …".

## Behaviour

- `surface-100`, `radius-xl`, `shadow-lg`, 560px wide. It sits centred, 15% from the top, over `overlay`. Below `bp-xs` it fills the screen.
- Groups have `overline` labels. The active row has `surface-hover` and a 2px `emerald-deep` bar on the left. Matching text shows in `emerald-deep` at weight 600.
- Arrows move, Enter runs and Escape closes. The list filters as you type, with a 50ms debounce (it waits 50ms after the last key). When the field is empty, recent items show first.

## Tokens

`surface-100`, `overlay`, `shadow-lg`, `radius-xl`, `radius-md`, `surface-hover`, `emerald-deep`, `border`, `ink`, `ink-muted`, `z-modal`.

## Mantine

`@mantine/spotlight`: `<Spotlight actions shortcut={['mod + K']} radius="xl" highlightQuery nothingFound="…" />` with `Spotlight.ActionsGroup`.
