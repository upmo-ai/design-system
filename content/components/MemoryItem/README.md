# MemoryItem

One remembered fact or one retrieved chunk: what Upmo knows, where it learned it, who it applies to and how to correct it.

## When to use

- Use it on the Memory page, which lists the facts the user and agents have taught Upmo. Use it in the agent's memory tab. Use it in the "Recalled for this reply" drawer under a chat message or task step.
- Knowledge base documents themselves go in a `Table`. A chunk pulled from one into a reply is a MemoryItem with the `Knowledge` badge.

## What the consumer provides

- `text`: the fact in `body`, `ink`. It shows three lines at most, then truncates with "More". A retrieved chunk may carry one `mark` on the matched phrase.
- `source`: a link in `body-sm` `ink-muted` to the chat or task run it came from ("Learned in Daily finance digest · run 9"). For knowledge, it links to the document and page.
- `scope` as a `Badge`: `User`, `Workspace`, `Agent · name`. `Knowledge` uses the info variant, so it reads as a different kind of thing.
- Optional `uses` ("Used 14 times"). Optional `score`: 0 to 1, two decimals, tabular, only in retrieval views. Optional `supersededAt` for a fact that was replaced.
- Actions: Edit and Delete for facts the user owns. Remove (the X) for a recalled chunk, which drops it from the context of this reply only. Show history for a replaced fact.

## Behaviour

- Rows sit in a `surface-100` list with `border` and `radius-lg`. Each row has 12px padding above and below, and hover shows `surface-hover`. Actions are `ActionIcon sm subtle`. They show on hover and focus, and are always visible on touch.
- A replaced fact stays in the list in `ink-muted`, with an outline "Replaced {date}" badge. The memory store is append-only: it only adds, it never edits in place. So "Delete" writes a tombstone, a deletion record that the history shows.
- Edit opens the fact inline as a `Textarea` with Save and Cancel. Saving creates a new fact that supersedes the old one. The row then shows "Learned in chat · today".
- Delete asks once in a `Modal` ("Forget this fact?"). The toast offers Undo for 10 seconds.
- The score never changes colour. It is a number in tabular figures. Sorting by score is the drawer's job, not the row's.

## Tokens

`surface-100`, `surface-hover`, `border`, `ink`, `ink-muted`, `emerald-deep` (mark), `info-soft` and `info` (knowledge badge), `radius-lg`, `body`, `body-sm`.

## Mantine

`Paper withBorder radius="lg"` holds a `Stack gap={0}` of rows. Each row is a `Group align="flex-start"` with `Text`, `Badge`, `Anchor` and `ActionIcon`s. Inline edit is `Textarea autosize`. The "Replaced" badge is `Badge variant="outline"`.
