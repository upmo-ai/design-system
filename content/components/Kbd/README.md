# Kbd

A keyboard key for shortcuts in menus, tooltips and hint lines, paired with `code` for inline code.

## When to use

- Use it for menu item shortcuts, the ⌘K launcher and the "Enter to send" hint. Use inline `code` for versions, model ids and commands in prose.

## What the consumer provides

- The key label: a symbol (⌘, ⇧) or a word (Enter, Esc). A group of keys is separate `Kbd` elements with `space-1` between them. Do not add a "+" sign.

## Behaviour

- 22px, `code-sm`, `surface-100`, `border-strong` with a 2px bottom edge, `radius-xs`. It is never clickable.

## Tokens

`surface-100`, `surface-200`, `border-strong`, `ink`, `radius-xs`.

## Mantine

`<Kbd size="xs">⌘</Kbd>`. Use inline `<Code>` for code.
