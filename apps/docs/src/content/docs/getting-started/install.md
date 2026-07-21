---
title: Install and link
description: How the product consumes the design system, published and in local development.
---

The Upmo product (`~/Work/upmo/web`) consumes the design system as real npm
packages. There are two paths: published versions for normal use, and a local
link for developing the two repos together.

## Published versions (the real dependency)

The product depends on published, semver-ranged packages:

```jsonc
// web/package.json
{
  "dependencies": {
    "@upmo-ai/tokens": "^1.0.0",
    "@upmo-ai/theme": "^1.0.0",
    "@upmo-ai/components": "^1.0.0",
    "@upmo-ai/icons": "^1.0.0",
    "@upmo-ai/brands": "^1.0.0"
  }
}
```

Set the provider up once:

```tsx
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import { MantineProvider } from '@mantine/core';
import { upmoTheme, cssVariablesResolver } from '@upmo-ai/theme';

<MantineProvider theme={upmoTheme} cssVariablesResolver={cssVariablesResolver}>
  {children}
</MantineProvider>;
```

## Local development link

To test an unreleased change in the product without publishing, link the local
checkout. With pnpm, from the product's `web` directory:

```sh
pnpm link ~/Work/upmo-design-system/packages/tokens
pnpm link ~/Work/upmo-design-system/packages/theme
pnpm link ~/Work/upmo-design-system/packages/components
```

Rebuild the linked package after a change (`pnpm --filter @upmo-ai/theme build`)
and the product's dev server picks it up. Unlink with `pnpm unlink` to return to
the published version.

This replaces the old approach, where the product built the design-system
packages from source with a postinstall script and `file:` links.
