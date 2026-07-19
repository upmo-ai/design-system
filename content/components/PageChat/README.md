# PageChat

A showcase of the Chat page, with the sidebar, a 280px chat list, the messages at `measure` width and the composer pinned to the bottom.

## What it demonstrates

- The chat list has search, a New chat `ActionIcon` and day groups in `overline`. The current chat sits on `surface-selected`. One chat has an archived badge.
- `ChatMessage` turns: a user bubble, then an assistant reply with the collapsed tool group, `Prose` with a `CodeBlock` and the metadata row. A streaming turn shows the lift caret and "Worked for 1.4 s".
- `Composer` with a knowledge chip, the model picker and attach. While a reply streams, Stop takes the place of Send. The Enter/Shift+Enter hint is in `Kbd`.
- The top bar breadcrumb names the chat. More actions holds rename, archive and delete.

## Responsive

Below `bp-md` the chat list hides behind a "Chats" button in the top bar. The composer is fixed to the bottom with the safe-area inset (the space phones keep clear at the screen edge), and the hint goes away. Messages keep `measure`, but the user bubble widens to 85%.
