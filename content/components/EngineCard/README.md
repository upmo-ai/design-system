# EngineCard

A selectable `Card` for choosing the engine that runs a task: Upmo's built-in engine, Claude Code, Codex, OpenCode, Cursor or Pi. It also shows where the sandbox lives, what the engine may use and what it must ask for first.

## When to use

- Use it in agent settings (default engine) and on the Settings page that shows what each engine may do. An engine is the program that does the work of a task with its tools.
- On the task detail page it is read-only. There it sums up the permissions that applied.

## What the consumer provides

- `name` (`h4` size `body`) and one line of `meta` that says what the engine is in plain words. Use the display names: Upmo, Claude Code, Codex, OpenCode, Cursor, Pi.
- `runtime` as a `Badge`: `Docker`, `Kubernetes`, `Upmo Cloud`. Caps (resource limits) in tabular figures, `body-sm` `ink-muted`: vCPU, memory and time limit, separated by middle dots.
- `permissions`: four group rows of `{ label, state }`: "Change files", "Run commands", "Use the internet" and "Use connectors". `state` is `allow` | `ask` | `block`. The connectors row has `state` `connector`, shown as "Per connector", because each connector keeps its own setting. Per-tool rules exist only under "Advanced", the same as on connectors. The full matrix lives in Settings.
- `selected`, `disabled` (with a reason in `meta`: "Not enabled on this instance"), `onSelect`.

## Behaviour

- It extends the selectable `Card`. At rest it has `border-strong`. When selected it gets an `emerald-deep` edge, a `surface-selected` ground and the caret. It uses `press-scale` on press and shows the focus ring. Cards in a grid share one height.
- Each permission row has a word and an icon, never colour alone. "Per connector" uses the plug icon in `ink`. Allow is the caret in `emerald-deep`. Ask first is the clock in `warning`. Block is the X in `ink-muted`, with the label in `ink-muted` too. A legend under the grid names the three states once.
- The permissions come from the allowlists and ceilings in the Go server. The card shows them and never edits them. Changing a permission is a Settings action with its own confirmation.
- A group of cards is a `radiogroup`. Arrow keys move the selection and Space selects. On phones the grid is one column. The permission list stays visible there, with no accordion, because the permissions are the reason to pick one engine over another.

## Tokens

`surface-100`, `surface-selected`, `border`, `border-strong`, `emerald-deep`, `warning`, `ink`, `ink-muted`, `ink-secondary`, `radius-lg`, `press-scale`, `body`, `body-sm`, `caption`.

## Mantine

`Radio.Group` with `Radio.Card` (Mantine 9), styled as the selectable Card. The caret check replaces `Radio.Indicator`. Rows are a `List spacing={4}` with one `ThemeIcon variant="transparent"` per state. Caps use `Text size="sm" c="dimmed"` with `style={{ fontVariantNumeric: 'tabular-nums' }}`.
