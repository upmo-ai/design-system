# Mantine

Upmo builds on Mantine 9, a React component library. The tokens in this system become the Mantine theme. Upmo components are Mantine components with these defaults. Anything only Upmo has (the caret, task status) is a small custom component. It uses Mantine primitives and the same CSS variables.

## Theme object

```ts
import { createTheme, rem } from '@mantine/core';

export const upmoTheme = createTheme({
  primaryColor: 'emerald',
  primaryShade: { light: 7, dark: 4 },
  colors: {
    emerald: [
      '#e8f3ed', '#cde6d8', '#a8d5bc', '#7cc29c', '#4fae7f',
      '#2f9a68', '#1f8a5b', '#176b47', '#125a3b', '#0d452d',
    ],
  },
  white: '#ffffff',
  black: '#141a17',
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontFamilyMonospace: '"Fira Code", ui-monospace, monospace',
  headings: {
    fontFamily: '"Manrope", system-ui, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(20), lineHeight: '1.4', fontWeight: '600' },
      h2: { fontSize: rem(17), lineHeight: '1.41' },
      h3: { fontSize: rem(15), lineHeight: '1.47' },
      h4: { fontSize: rem(13), lineHeight: '1.38' },
    },
  },
  fontSizes: { xs: rem(12), sm: rem(13), md: rem(15), lg: rem(17), xl: rem(20) },
  lineHeights: { xs: '1.33', sm: '1.38', md: '1.47', lg: '1.53', xl: '1.4' },
  spacing: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(20), xl: rem(24) },
  radius: { xs: rem(4), sm: rem(6), md: rem(8), lg: rem(12), xl: rem(16) },
  defaultRadius: 'md',
  shadows: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  focusRing: 'auto',
  cursorType: 'pointer',
  respectReducedMotion: true,
  components: {
    Button: { defaultProps: { size: 'md', radius: 'md' } },
    TextInput: { defaultProps: { size: 'md', radius: 'md' } },
    Select: { defaultProps: { size: 'md', radius: 'md', checkIconPosition: 'right' } },
    Card: { defaultProps: { radius: 'lg', withBorder: true, padding: 'md', shadow: undefined } },
    Modal: { defaultProps: { radius: 'xl', centered: true, overlayProps: { backgroundOpacity: 0.48 } } },
    Badge: { defaultProps: { radius: 'xl', variant: 'light', size: 'md' } },
    Tooltip: { defaultProps: { openDelay: 400, radius: 'md' } },
    Notifications: { defaultProps: { position: 'bottom-right', autoClose: 5000, pauseResetOnHover: 'notification' } },
  },
});
```

## Surface and text variables

The theme object holds no colour literal. Shadows point at the `shadow-*` tokens. Each holds a light value (Ink at 8 to 16%) and a dark value (black at 40 to 65%), and switches with `data-theme`. One CSS file, loaded after `@mantine/core/styles.css`, overrides Mantine's semantic variables. It reads the Upmo tokens, so both theme toggles agree:

```css
:root, [data-mantine-color-scheme="light"] {
  --mantine-color-body: var(--surface-000);
  --mantine-color-text: var(--ink);
  --mantine-color-dimmed: var(--ink-muted);
  --mantine-color-default: var(--surface-100);
  --mantine-color-default-hover: var(--surface-hover);
  --mantine-color-default-border: var(--border-strong);
  --mantine-color-placeholder: var(--ink-muted);
  --mantine-color-anchor: var(--emerald-deep);
  --mantine-color-error: var(--danger);
  --mantine-primary-color-filled: var(--emerald-deep);
  --mantine-primary-color-filled-hover: var(--emerald-hover);
  --mantine-primary-color-light: var(--emerald-soft);
  --mantine-primary-color-light-color: var(--emerald-deep);
  --mantine-primary-color-contrast: var(--ink-on-brand);
}
[data-mantine-color-scheme="dark"] { /* same lines; the tokens already carry the dark values under [data-theme="dark"] */ }
```

Keep `data-theme` and `data-mantine-color-scheme` in sync from one store. `useMantineColorScheme` drives both.

## Component mapping

| Upmo component | Mantine | Notes |
| --- | --- | --- |
| Button | `Button` | variants filled (primary), light, outline, subtle, and `color="danger"` for destructive. `loading` swaps the left icon for the draw caret via `loaderProps={{ children: <CaretLoader/> }}`. |
| ActionIcon | `ActionIcon` | icon-only, `aria-label` required, `variant="subtle"` default. |
| TextInput, Textarea, Select | `TextInput`, `Textarea` (`autosize`, `maxRows={8}`), `Select` (`searchable` above 10 options) | The error prop renders the X icon. The description sits above the error. |
| Checkbox, Radio, Switch, SegmentedControl, Chip | same names | `Checkbox` icon is the caret via `icon` prop. |
| Stepper | `Stepper` | `completedIcon` is the caret. `allowNextStepsSelect={false}`. |
| Card | `Card` with `withBorder` | No shadow. Clickable cards use `component="a"`. |
| Badge | `Badge` | `leftSection` holds the status icon. The text is the status word. |
| StatusCaret | custom (`CaretStatus`) | one SVG, props `status: queued | preparing | planning | working | checking | done | failed`. |
| Alert, Notification | `Alert`, `@mantine/notifications` | `variant="default"` on `surface-100` with the 4px left status edge (`::before`) and a `ThemeIcon variant="light" radius="xl" size={32}` for the icon. Never the tinted `light` ground. |
| Loader, Skeleton, Progress | custom `CaretLoader` (sets `theme.components.Loader.defaultProps.type`), `Skeleton`, `Progress` | Progress `size={4}`, `radius="xl"`. |
| EmptyState | composition: `Stack` + `ThemeIcon` + `Title order={3}` + `Text` + `Button` | |
| Sidebar, Tabs, Breadcrumbs, Pagination, Menu | `AppShell.Navbar` + `NavLink`, `Tabs`, `Breadcrumbs`, `Pagination`, `Menu` | Tabs `variant="default"`. NavLink `variant="light"` when active. |
| Modal, Tooltip | `Modal`, `Tooltip` | Drawer uses `Drawer position="right" size={480}`. |
| Table | `Table` with `stickyHeader`, `highlightOnHover` | wrap in `Table.ScrollContainer minWidth={640}`. |
| Avatar, Kbd | `Avatar`, `Kbd` | Avatar fallback is initials on `emerald-soft`. |
| BrandTile | `Radio.Group` of `Radio.Card radius="lg"` | `Radio.Indicator` top left, the mark from `@upmo-ai/brands` at 40px, `IconServer` in `ink-muted` when the mark is unknown. |
| BrandSelect | `Select` with `renderOption` and `leftSection` | Grouped `data`. The mark at 20px per row. Cost or `Badge` on the right. |
| DiffBlock | custom on `Code` | unified diff, added and removed rows on `success-soft` and `danger-soft`, line numbers in `ink-muted`. |
| TerminalStream | custom on `ScrollArea` | monospace stream, auto-follow with a "Jump to latest" `Button subtle sm` when scrolled up. |
| ArtifactViewer | `Tabs orientation="vertical"` with one `Tabs.Panel` per artifact | viewers load on demand: pdf.js, Monaco read only, `Table` for CSV, a sandboxed frame for HTML, `EmptyState` with Download for anything else. |
| MemoryItem | composition: `Paper withBorder` + `Text` + `Badge outline` + `ActionIcon` | supersede and forget as `Menu` items. |
| HarnessCard | `Radio.Card` as the selectable `Card` | Text-only options (Native, This server, Upmo Cloud). No mark. |

## Icons

`@tabler/icons-react`, `size={20}`, `stroke={1.75}`. Wrap it once as `<Icon name="…">`, so you do not repeat the size and stroke. The caret is not a Tabler icon. Its SVG files ship in `@upmo-ai/icons`, and a React component for it comes with `@upmo-ai/ui` later.

## Fonts

Self-host Manrope variable (`wght` 400 to 700) and Fira Code. Load Familjen Grotesk 700 only on marketing pages. Use `font-display: swap`.
