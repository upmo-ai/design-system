# BrandSelect

A `Select` for things that have a logo, such as models grouped by provider, connectors and delivery targets, with the 20px mark in the trigger and in every row.

## When to use

- Use it for the model picker in the composer and in agent settings. Use it for the connector and Delivery fields in automation and task forms, and for the provider filter in Usage.
- Lists without marks stay a plain `Select`.

## What the consumer provides

- `data`: groups by provider or type. Each option is `{ value, label, mark, sub?, right?, disabled?, reason? }`.
- `sub` is a short qualifier in `ink-muted` after the label ("this machine", "key not on plan").
- `right` is the cost per 1k tokens, a status `Badge`, or "Not connected", in tabular figures (digits of equal width, so columns line up).
- A model picker starts with "Auto". Its mark is the caret and its sub is "cheapest that passes".
- Everything `Select` takes: `label`, `description`, `searchable`, `error`.

## Behaviour

- The trigger looks like a `TextInput`: 40px, `border-strong`, mark then label, chevron on the right.
- When open, the border is `emerald-deep`. The list sits on `surface-100` with `border`, `shadow-sm`, `radius-lg` and 4px padding. Rows are 40px. Group labels are `overline`.
- The chosen row shows the caret on the right in `emerald-deep`. Hover shows `surface-hover`.
- Disabled rows stay visible in `ink-disabled`. The reason shows as their `sub`, and their mark turns grayscale.
- Every model shows its cost, which is the gateway's list price. An unknown cost shows the word "unknown". Never a guess, because people choose models by what they will pay.
- Marks are the official artwork in official colours, at 20px. The label is always beside the mark. Search matches the label and the provider name.
- Some options have no mark: a custom OpenAI-compatible endpoint, a self-hosted MCP server, vLLM, LiteLLM. For these, Tabler `server` at 20px in `ink-muted` takes the mark's place, so the rows stay aligned. Never a guessed logo, and never an empty gap.
- Keyboard and screen reader work as in `Select`: `listbox`, `option`, arrows, type-ahead, Enter, Escape. The mark is `aria-hidden`.

## Tokens

As `Select`, plus `emerald-deep` (chosen), `ink-disabled`, `success-soft`/`success` and `warning-soft`/`warning` for connector status badges.

## Mantine

`Select` with `renderOption={({ option, checked }) => <Group><BrandMark name={option.mark}/><Text>{option.label}</Text>…</Group>}`. Use `leftSection` on the trigger for the selected mark, and grouped `data` for providers. Connectors use the same setup with a `Badge` on the right.
