# Accordion

An accordion stacks sections that open one at a time, such as FAQs, advanced settings or grouped task sources.

## When to use

- Use it for content that people scan by heading and open only when they need it. Do not use it for the main content of a page. That is plain headings and text.

## What the consumer provides

- Items, each with a heading (a question or a noun phrase) and panel content. Use `multiple` only for settings groups where several panels may stay open.
- Open the first item by default when the content is informational.

## Behaviour

- The ground is `surface-100` with `border` and `radius-lg`. A `border` rule separates the items. Headers are 52px buttons. The chevron rotates 180° over 200ms. Hover shows `surface-hover`.
- Each header is a real `h3` element around a `button` with `aria-expanded` and `aria-controls`. Enter or Space opens and closes a section. Up and Down move between headers.

## Tokens

`surface-100`, `border`, `surface-hover`, `ink`, `ink-muted`, `ink-secondary`, `radius-lg`.

## Mantine

`<Accordion variant="contained" radius="lg" defaultValue="first">` with `Accordion.Item`, `Accordion.Control`, `Accordion.Panel`.
