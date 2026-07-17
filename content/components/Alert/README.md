# Alert

An inline notice that stays on the page until the problem it describes is resolved.

## When to use

- Use it for something the user must act on or know about on this page. Examples: approval needed, a key expired, setup finished, a note about local models.
- Short confirmations that come and go are a `Notification`. A problem with one field goes in that field's own message.

## What the consumer provides

- `variant`: `info | success | warning | danger`. The icon follows the variant: info circle, caret, clock, X.
- `title` (short, optional) and one line of text. The text says what happened and what to do.
- Optional actions: one `filled sm` button and one `subtle sm` button.
- Use `role="alert"` for a danger alert that interrupts, and `role="status"` for the rest. Use `withCloseButton` only for info.

## Behaviour

- The alert sits at the top of the content it is about, at full width. It is a `surface-100` card with `border` and `radius-lg`.
- A 4px status edge runs down the whole left side. The card's own radius clips it, so it follows the corners. The icon sits in a 32px circle on the status `-soft` tint.
- The title is `ink` and the text is `ink-secondary`. Status colour appears only on the edge and the icon. So four alerts in a column read as one calm list, in both themes.
- Padding is `space-4`. Icon and text are 12px apart, with 8px above the actions. The first text line lines up with the centre of the icon circle.
- Never stack more than two. Combine them, or show the most important one.

## Tokens

`surface-100`, `border`, `info-soft`/`info`, `success-soft`/`success`, `warning-soft`/`warning`, `danger-soft`/`danger`, `ink`, `ink-secondary`, `radius-lg`, `space-4`.

## Mantine

`<Alert variant="default" color="warning" icon={<ThemeIcon variant="light" color="warning" radius="xl" size={32}><IconClock size={18}/></ThemeIcon>} title="…" radius="lg">`. The left edge comes from `styles={{ root: { '::before': { background: 'var(--warning)' } } }}`.
