---
title: Overview
description: What the Upmo design system is and how it is built.
---

Upmo runs always-on AI agents on infrastructure you own. This design system is
the single source of truth the product consumes: tokens, a Mantine 9 theme, a
real React component library, icons and brand assets.

## Packages

- **`@upmo-ai/tokens`** - design tokens as CSS variables (light, dark, high
  contrast) and a typed JS object. No React.
- **`@upmo-ai/theme`** - the Mantine 9 theme built from tokens, plus the
  resolver that maps Mantine's internals onto the token variables.
- **`@upmo-ai/components`** - the real React component library. _(coming)_
- **`@upmo-ai/icons`** and **`@upmo-ai/brands`** - the icon concept map and the
  provider brand marks. _(coming)_

## How previews work

Every preview on this site renders the real React component through
`MantineProvider` + `upmoTheme`, inside a surface you can switch between light,
dark and high contrast. There is no second, drifting implementation: what you
see is what the product ships.
