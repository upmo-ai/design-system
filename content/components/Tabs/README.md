# Tabs

Several views of the same object, side by side under one title.

## When to use

- A task's Activity and Result. Settings sections. Use two to six tabs.
- Moving between different objects or pages is navigation, not tabs.

## What the consumer provides

- `tabs`: `{ value, label, count? }[]`. Labels are one or two words. A count `Badge` is optional.
- `value` and `onChange`. The first tab is selected by default. The URL hash holds the selected tab, so it survives a reload.

## Behaviour

- Underline style: tabs are 40px high with `ink-muted` text. The selected tab is `emerald-deep`, weight 600, with a 2px `emerald-deep` underline. Hover shows `surface-hover`.
- The tab list is one Tab stop. Left and Right move and select. Home and End jump to the ends.
- On phones, tabs scroll sideways with a fade at the edges. They never wrap onto two rows.

## Tokens

`border`, `ink-muted`, `ink`, `emerald-deep`, `surface-hover`, `radius-md`, `control-md`.

## Mantine

`<Tabs value onChange variant="default" radius="md">` with `Tabs.List`, `Tabs.Tab rightSection={<Badge/>}`, `Tabs.Panel`.
