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
  '--mantine-primary-color-light': 'var(--emerald-soft)',
  '--mantine-primary-color-light-color': 'var(--emerald-deep)',
  '--mantine-primary-color-contrast': 'var(--ink-on-brand)',
};

// The filled primary follows the scheme-aware primary-fill token, so the dark
// button uses the brighter, vivid emerald rather than the pale emerald-deep.
const primaryFill: Record<string, string> = {
  '--mantine-primary-color-filled': 'var(--primary-fill)',
  '--mantine-primary-color-filled-hover': 'var(--primary-fill-hover)',
};

// The token variables map, exported for tests and for the docs preview pipeline
// that needs the same names without pulling the resolver function.
export const tokenVariables: Record<string, string> = { ...shared, ...primaryFill };

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: tokenVariables,
  dark: tokenVariables,
});
