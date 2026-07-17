# Notification

A toast that confirms something happened, shown for a short time in the corner.

## When to use

- Use it after an action completes or fails: "Task started", "Saved", "Could not archive chat".
- Things the user must deal with on this page go in an `Alert` instead.

## What the consumer provides

- `title`: what happened, in the past tense. An optional one-line `message`. `color` for the status icon.
- One optional action: "Undo", "Try again", "View". A toast with an action does not close on its own.
- `role="status"` by default. `role="alert"` for failures.

## Behaviour

- It sits bottom right on desktop and top centre on phones. `surface-100`, `border`, `shadow-md`, `radius-lg`, max 380px wide. The status icon sits in a 32px circle on its `-soft` tint, as in `Alert`. The title stays `ink`.
- It enters with a 240ms rise and fade and closes after 5s. Hover and focus pause it. The newest toast is at the bottom. At most three show, and older ones collapse.
- Undo beats confirm: archive at once, then show a toast with Undo. People keep moving, and a mistake is still one click from fixed.

## Tokens

`surface-100`, `border`, `shadow-md`, `radius-lg`, `success`, `danger`, `warning`, `info`, `ink`, `ink-muted`, `z-toast`.

## Mantine

`notifications.show({ title, message, color: 'success', icon: <Caret/>, autoClose: 5000 })` from `@mantine/notifications`, with the provider positioned `bottom-right` and `pauseResetOnHover="notification"`, so hover pauses only that toast.
