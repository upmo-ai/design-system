import type { PrismTheme } from 'prism-react-renderer';

// An Upmo syntax theme for prism-react-renderer. Colours are Upmo CSS variables
// (chart + ink + status tokens), so highlighting follows the active theme
// (light, dark, high contrast) with no separate per-scheme theme. The base
// ground/text come from the CodeBlock surface; these only colour the tokens.
export const upmoPrismTheme: PrismTheme = {
  plain: {
    color: 'var(--ink)',
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--ink-muted)', fontStyle: 'italic' },
    },
    {
      types: ['punctuation'],
      style: { color: 'var(--ink-secondary)' },
    },
    {
      types: ['property', 'tag', 'symbol', 'deleted'],
      style: { color: 'var(--chart-4)' }, // pink/magenta
    },
    {
      types: ['boolean', 'number', 'constant'],
      style: { color: 'var(--chart-6)' }, // orange
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: { color: 'var(--chart-1)' }, // emerald/green
    },
    {
      types: ['operator', 'entity', 'url'],
      style: { color: 'var(--chart-3)' }, // amber
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: { color: 'var(--chart-2)' }, // blue
    },
    {
      types: ['function', 'class-name'],
      style: { color: 'var(--chart-5)' }, // violet
    },
    {
      types: ['regex', 'important', 'variable'],
      style: { color: 'var(--chart-3)' },
    },
    {
      types: ['important', 'bold'],
      style: { fontWeight: 'bold' },
    },
    {
      types: ['italic'],
      style: { fontStyle: 'italic' },
    },
  ],
};
