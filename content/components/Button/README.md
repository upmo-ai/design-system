# Button

A button reacts the moment you press it, and its label names the action it runs.

## When to use

- Use one `filled` button per view, for the main action: "Start task", "Connect", "Send".
- Use `light` for a second action next to it. Use `outline` for neutral actions in toolbars. Use `subtle` for the least important actions and for inline actions. Use `danger` (filled or outline) for actions that destroy something.
- Do not use a button to go somewhere. A link to another page is an anchor, styled as `subtle` or as plain text.

## What the consumer provides

- `children`: a verb phrase in sentence case. Never "OK", "Submit" or "Yes". The label tells people what will happen before they press.
- `variant`: `filled | light | outline | subtle | danger | danger-outline`. `size`: `sm | md | lg` (32, 40, 48px). `leftSection`: an icon at `icon-md`, or `icon-sm` on a `sm` button.
- `loading`: the draw caret replaces the icon. The button sets `aria-busy`, keeps its width and ignores clicks.
- `disabled`: renders `aria-disabled`, so the button stays focusable. It sits inside a `Tooltip` that says why it is off.
- `fullWidth`: use it on phones, in action rows and in modals.

## Behaviour

- Hover shows `emerald-hover` (120ms). Press shows `emerald-active` and scales the button to 0.98. Focus shows the `focus` ring.
- After an async action (one that waits for the server), show the result. Use a `Notification` or an inline `success` message. Never drop back to idle in silence: a person who started a task needs to know it started.
- Icons go on the left only. The send button is the one exception: it is the caret alone, in an `ActionIcon`.

## Tokens

`emerald-deep`, `emerald-hover`, `emerald-active`, `ink-on-brand`, `emerald-soft`, `surface-hover`, `border-strong`, `danger`, `danger-soft`, `surface-200`, `ink-disabled`, `radius-md` (`radius-sm` at `sm`), `control-sm|md|lg`.

## Mantine

`<Button variant="filled" size="md" leftSection={<Icon/>} loading loaderProps={{ children: <CaretLoader/> }}>`. `danger` is `color="danger"`. `danger-outline` is `variant="outline" color="danger"`.

## Don't

- Two filled buttons side by side.
- A loading label that makes the button change width.
- Colour alone to mean danger. The label says "Delete".
