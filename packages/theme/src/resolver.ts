import type { CSSVariablesResolver } from '@mantine/core';

// Mantine writes its own colour variables onto the document as inline styles.
// A stylesheet cannot override an inline variable, so this resolver is what makes
// Mantine's internals follow the Upmo tokens. The token variables themselves are
// defined in @upmo-ai/tokens/tokens.css, scoped by [data-theme]; here we only
// point Mantine's names at them.
//
// Values that are the same in light and dark (they resolve through the token
// layer, which is already theme-scoped) live in `shared`. Values that must
// differ by scheme (the primary fill: emerald-deep in light, the brighter
// primary-fill in dark) are split into light and dark.

const shared: Record<string, string> = {
  '--mantine-color-body': 'var(--surface-000)',
  '--mantine-color-text': 'var(--ink)',
  '--mantine-color-dimmed': 'var(--ink-muted)',
  '--mantine-color-default': 'var(--surface-100)',
  '--mantine-color-default-hover': 'var(--surface-hover)',
  '--mantine-color-default-border': 'var(--border-strong)',
  '--mantine-color-placeholder': 'var(--ink-muted)',
  '--mantine-color-anchor': 'var(--emerald-deep)',
  '--mantine-color-error': 'var(--danger)',
  '--mantine-primary-color-contrast': 'var(--ink-on-brand)',
};

// The filled primary follows the scheme-aware primary-fill token, so the dark
// button uses the brighter, vivid emerald rather than the pale emerald-deep.
const primaryFill: Record<string, string> = {
  '--mantine-primary-color-filled': 'var(--primary-fill)',
  '--mantine-primary-color-filled-hover': 'var(--primary-fill-hover)',
};

// The light (soft) primary/emerald ground. Mantine injects emerald's variants
// inline (it is our custom colour), so a stylesheet cannot override them; they
// must be set here. In light, emerald-soft is already a pale mint. In dark,
// emerald-soft is a RICH green (right for status grounds) but too dark for a
// light-variant badge, which should read airy like the other soft badges, so
// dark uses a lighter emerald tint on the card surface to match them.
const emeraldSoftLight: Record<string, string> = {
  '--mantine-primary-color-light': 'var(--emerald-soft)',
  '--mantine-primary-color-light-color': 'var(--emerald-deep)',
  '--mantine-primary-color-light-hover': 'var(--surface-selected)',
  '--mantine-color-emerald-light': 'var(--emerald-soft)',
  '--mantine-color-emerald-light-color': 'var(--emerald-deep)',
  // Filled emerald badge = the button's lively fill, with dark on-brand text.
  '--mantine-color-emerald-filled': 'var(--primary-fill)',
  '--mantine-color-emerald-filled-hover': 'var(--primary-fill-hover)',
};

const emeraldSoftDark: Record<string, string> = {
  '--mantine-primary-color-light': 'color-mix(in srgb, var(--emerald-deep) 14%, var(--surface-100))',
  '--mantine-primary-color-light-color': 'var(--emerald-hover)',
  '--mantine-primary-color-light-hover': 'color-mix(in srgb, var(--emerald-deep) 22%, var(--surface-100))',
  '--mantine-color-emerald-light': 'color-mix(in srgb, var(--emerald-deep) 14%, var(--surface-100))',
  '--mantine-color-emerald-light-color': 'var(--emerald-hover)',
  '--mantine-color-emerald-filled': 'var(--primary-fill)',
  '--mantine-color-emerald-filled-hover': 'var(--primary-fill-hover)',
};

// Destructive actions (color="red") follow the danger token, not Mantine's
// default red. Set here so the scheme-scoped resolver output wins over
// Mantine's own red. danger is theme-scoped, so one mapping serves every
// scheme. Hover mixes toward ink, which darkens the fill in light and hc and
// lightens it in dark, so the hover keeps (and raises) the text contrast. Text on the filled fill is ink-on-brand, set in styles.css because
// Mantine resolves the filled text to white: white on danger is 7.0:1 light and
// 10.2:1 hc; dark ink-on-brand on the coral dark danger is 9.7:1 (white there
// would be 2.0:1). Hover: 8.2:1 light, 10.5:1 dark, 12.0:1 hc.
const danger: Record<string, string> = {
  '--mantine-color-red-filled': 'var(--danger)',
  '--mantine-color-red-filled-hover': 'color-mix(in srgb, var(--danger) 85%, var(--ink))',
  '--mantine-color-red-outline': 'var(--danger)',
  '--mantine-color-red-outline-hover': 'color-mix(in srgb, var(--danger) 8%, transparent)',
  '--mantine-color-red-text': 'var(--danger)',
};

// The token variables map, exported for tests and for the docs preview pipeline
// that needs the same names without pulling the resolver function.
export const tokenVariables: Record<string, string> = {
  ...shared,
  ...primaryFill,
  ...danger,
  ...emeraldSoftLight,
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { ...shared, ...primaryFill, ...danger, ...emeraldSoftLight },
  dark: { ...shared, ...primaryFill, ...danger, ...emeraldSoftDark },
});
