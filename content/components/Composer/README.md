# Composer

The message box at the bottom of Chat, with context chips, a growing text area, a model picker, attach, dictate and the send caret.

## When to use

- Use it in Chat and in the Activity tab of a working task, for messages to that task. The "New task" goal field is a plain `Textarea` in a form.

## What the consumer provides

- `value`, `onSend` and `onAttach`.
- The knowledge `Chip` row. Checked chips are the knowledge folders in play, plus "Add context".
- The model picker, as a `subtle sm` button that opens a `Select`-style list ("Auto" by default).
- Dictate shows only when the whisper profile is enabled. Otherwise the button is disabled, with a tooltip.

## Behaviour

- `surface-100`, `border-strong`, `radius-xl`. On focus, the edge turns `emerald-deep` and `shadow-md` lifts it. It grows to 8 lines, then scrolls.
- The send `ActionIcon` is `filled` with the caret. It stays disabled (`surface-200`, `ink-disabled`) until there is text. Enter sends and Shift+Enter adds a new line. The hint under the composer says so in `Kbd`.
- While a reply streams, send becomes Stop (a square icon, `outline`). People can stop an agent as soon as they see it going the wrong way. Attachments show as removable `Chip`s above the text.
- On phones it is fixed to the bottom, with the safe-area inset (the space the notch and home bar need). The hint hides.

## Tokens

`surface-100`, `surface-200`, `border-strong`, `emerald-deep`, `shadow-md`, `radius-xl`, `ink`, `ink-muted`, `ink-disabled`, `ink-on-brand`.

## Mantine

Composition: `Paper radius="xl" withBorder`, `Textarea autosize minRows={1} maxRows={8} variant="unstyled"`, `Chip.Group`, `ActionIcon variant="filled"`, `Kbd`.
