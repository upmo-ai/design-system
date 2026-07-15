# TextInput

A single-line field with a visible label, a description, and a message line that reacts as the user types.

## When to use

- Short text: names, keys, hosts, handles, and numbers with `inputmode`.
- Secrets use `type="password"` with a reveal `ActionIcon` on the right.
- Longer text goes in a `Textarea`. A fixed set of values goes in a `Select`.

## What the consumer provides

- `label`: required, and a noun. `description`: where to find the value. `placeholder`: an example of the format, never the label.
- `leftSection` or `rightSection` icons at `icon-sm`. A right section may hold an `ActionIcon` (reveal, clear, copy).
- `error`: the fix, as a sentence. `success`: a confirmation after an async check. Both show under the field with their icon.
- `required` is the default. Mark optional fields with "(optional)" in the label.
- `size`: `md` (40px) by default, `sm` (32px) in tables and toolbars.

## Behaviour

- The border is `border-strong`. Hover turns it `ink-muted`. Focus turns it `emerald-deep` and adds the `focus` ring.
- Validate on blur first. Once a field has been invalid, validate on every input. The error then clears the moment it is fixed.
- Invalid: a `danger` border, `aria-invalid="true"`, and a message with the X icon. `aria-describedby` points to the description and the message.
- Success after a check: an `emerald-deep` border, with the caret icon beside the message. People see that their key works before they start a task.
- Disabled: a `surface-200` ground and `ink-disabled` text. The description says why, or where to change it.

## Tokens

`surface-100`, `border-strong`, `emerald-deep`, `focus`, `danger`, `success`, `ink`, `ink-muted`, `ink-disabled`, `surface-200`, `radius-md`, `control-md`, `control-sm`, `space-3`.

## Mantine

`<TextInput label description placeholder error leftSection rightSection size="md" radius="md" />`. Use `PasswordInput` for secrets. Wire it with `useForm({ validateInputOnBlur: true })`. Once a field is touched, re-validate on change (`validateInputOnChange` after the first error).
