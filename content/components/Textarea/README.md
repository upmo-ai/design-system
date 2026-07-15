# Textarea

A multi-line field for goals, instructions and messages that grows with the text and counts characters when there is a limit.

## When to use

- Task goals, agent instructions, the chat composer, feedback. Use it for anything longer than one sentence.

## What the consumer provides

- `label` and `description`. A `placeholder` written as a question or an example ("What should the agent deliver?").
- `minRows` (default 3) and `maxRows` (default 8). Past `maxRows`, the field scrolls inside.
- `maxLength` when the backend has a limit. The counter shows `n / max` and turns `danger` at 90%.
- `error` and `success` messages, as in `TextInput`.

## Behaviour

- It has the same states as `TextInput`. It resizes on every input and never jumps.
- Enter adds a new line. In the chat composer, Enter sends and Shift+Enter adds a new line. The hint under the composer says so.
- When someone pastes a long block, the field stays at `maxRows` and scrolls to the text cursor.

## Tokens

As `TextInput`, plus `ink-muted` for the counter and `danger` when over.

## Mantine

`<Textarea autosize minRows={3} maxRows={8} maxLength={600} label description error />` with a custom `rightSection` or a trailing `Text` for the count.
