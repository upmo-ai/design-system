# ChatMessage

One turn in a chat: the user's bubble on the right, and the assistant's reply on the left under the caret avatar.

## When to use

- Use it on the Chat page and in any embedded chat, such as messages to a working task in its Activity tab.

## What the consumer provides

- `role`: `user | assistant`. User content is plain text.
- Assistant content is Markdown, rendered with `Prose`. It can have a tool-call group ("3 tool calls · 2.8 s") that expands to `CodeBlock` rows.
- The assistant reply ends in a metadata row: model, tokens, duration and cost (or "unknown"). Copy and Activity `subtle` buttons sit in the same row.
- Tokens show as chevron-up 12k in and chevron-down 1.2k out. These are Tabler glyphs, not the mark.
- A streaming state: the lift caret and "Thinking", then the text as it arrives. People can see the agent is working before the first word lands.

## Behaviour

- User bubble: `surface-100`, `border`, `radius-lg` with a `radius-xs` bottom-right corner, at most 75% wide.
- Assistant: no bubble. A 20px `emerald` caret avatar, and prose at `measure`.
- The tool group sits on `surface-200` with `radius-md`, closed by default. Failed calls show the X in `danger`.
- Metadata is `body-sm` in `ink-muted`, with tabular numbers. Hovering a message does not reveal hidden controls. Copy and Activity are always there.

## Tokens

`surface-100`, `surface-200`, `border`, `emerald`, `ink`, `ink-secondary`, `ink-muted`, `danger`, `radius-lg`, `radius-md`, `radius-xs`, `measure`.

## Mantine

Composition: `Paper` for the bubble, `Group`/`Stack`, `Prose` for content, and `Button variant="subtle" size="compact-sm"` for the meta actions.
