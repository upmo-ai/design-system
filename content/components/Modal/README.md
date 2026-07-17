# Modal

A focused dialog for a decision or a short task that must finish before the page goes on.

## When to use

- Use it to confirm destructive or expensive actions, for a short form (rename, new chat) and for a picker.
- Long forms and detail views use a right-hand drawer instead. Quick confirmations that can be undone use a `Notification` with Undo instead.

## What the consumer provides

- `title`: the question or task ("Delete this task?", "Rename chat"). Body text that names what will happen or what will be lost.
- Actions: a `subtle` "Cancel" first, then the primary button that names the action. A destructive primary uses `danger`. In a destructive dialog, Cancel takes focus first. In a form, the first field does.
- `onClose`. Set `closeOnClickOutside={false}` when the form is dirty (has unsaved changes).

## Behaviour

- Centred, max 560px (480px for confirmations), `surface-100`, `radius-xl`, `shadow-lg`, over `overlay`. Below `bp-xs` it fills the screen, with the actions stacked and the primary on top.
- It enters with a 240ms fade and an 8px rise, and leaves in 160ms. It traps focus and closes on Escape. Focus then returns to the control that opened it.
- The title is `h2`. `aria-labelledby` and `aria-describedby` are set.

## Tokens

`surface-100`, `overlay`, `shadow-lg`, `radius-xl`, `ink`, `ink-secondary`, `space-6`, `z-overlay`, `z-modal`.

## Mantine

`<Modal opened onClose title centered radius="xl" overlayProps={{ backgroundOpacity: 0.48 }} fullScreen={isPhone}>`. Use `Drawer position="right" size={480}` for inspectors.
