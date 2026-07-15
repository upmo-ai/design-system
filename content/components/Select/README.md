# Select

One value from a list of six or more options, with search above ten.

## When to use

- Models, providers, engines, time zones, agents: lists the user did not write.
- Up to five short options: use `Radio` or `SegmentedControl`, so every option is visible.
- Many values at once: use `MultiSelect` or a `Chip` group.
- Options that are brands (models by provider, connectors): use `BrandSelect`. It adds the official mark to every row.

## What the consumer provides

- `label`, `description`, and a `placeholder` written as an instruction ("Choose an engine").
- `data`: `{ value, label, description?, group?, disabled? }[]`. `description` is short secondary text after the label, such as the provider of a model. Put the recommended option first and say why in the field description.
- `searchable` above ten options.
- `error`, as in `TextInput`.
- An optional `leftSection` icon at `icon-sm`, such as `world` for a time zone.

## Behaviour

- The native `select` element is not used. The control is a custom combobox, so the open list matches the system.
- The trigger is a `TextInput`: same height, radius, border, focus ring, invalid state and disabled state. It shows the chosen label, or the placeholder in `ink-muted`.
- A chevron-down at `icon-sm` in `ink-muted` sits on the right. It turns 180° when the list opens, in `duration-base`. While the list is open, the trigger border is `emerald-deep`.
- The list is a `Menu` panel: `surface-100`, `border`, `radius-lg`, `shadow-sm`, 4px padding, 4px below the trigger. It fades in and rises 4px in `duration-enter`, and leaves in `duration-leave`. Under reduced motion it only fades, in `duration-fast`.
- Rows are 36px with `radius-sm`. Eight rows show, then the list scrolls. Hover and the keyboard-active row use `surface-hover`. Group labels use the `overline` style.
- The chosen row has `emerald-deep` text and the caret on the right. The caret takes the place of the Tabler `check` icon, as everywhere in Upmo.
- Secondary text follows the label in `ink-muted` at 13px. When space is short, the secondary text is cut first.
- A disabled option stays visible in `ink-disabled`. The keyboard and the mouse skip it.
- With search, a filter input with the `search` icon sits at the top of the panel. It takes focus when the list opens. It matches the label and the secondary text. A group with no match hides. With no match at all, the panel says "No matches".
- Picking an option closes the list and returns focus to the trigger. Escape closes it the same way, with no change. A click outside or Tab also closes it.

## Keyboard

- Closed: ArrowDown, ArrowUp, Enter and Space open the list on the chosen option. Without search, typing a letter opens the list on the first match.
- Open: ArrowDown and ArrowUp move one row. Home and End jump to the first and last row. Enter picks the active row. Space also picks when there is no filter input. Escape closes.
- Typeahead: type the first letters of a label to jump to it. Letters typed within half a second count as one search. The same single letter again moves to the next match.

## Accessibility

- The trigger has `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`. Its name comes from the label.
- The list has `role="listbox"`. Each row has `role="option"` and `aria-selected`. A group has `role="group"` and `aria-labelledby` pointing to its label.
- Focus stays on the trigger, or on the filter input when there is one. `aria-activedescendant` points to the active row.
- An invalid field sets `aria-invalid` and `aria-describedby` on the trigger. "No matches" is a `status` live region.

## Tokens

As `TextInput`, plus `surface-100`, `border`, `radius-lg`, `radius-sm`, `shadow-sm`, `surface-hover`, `emerald-deep`, `ink-muted`, `ink-disabled`, `icon-sm`, `z-dropdown`, `duration-base`, `duration-enter`, `duration-leave`, `duration-fast`, `ease-standard`, `ease-leave`.

## Mantine

`<Select label data searchable checkIconPosition="right" nothingFoundMessage="No matches" />` with `classNames={{ input: 'u-input u-select-trigger', dropdown: 'u-select-drop', option: 'u-opt' }}`. Set the panel with `comboboxProps={{ offset: 4, shadow: 'sm', radius: 'lg', transitionProps }}`: `transitionProps` is a 4px fade-down with `duration` from `duration-enter` and `exitDuration` from `duration-leave`. `renderOption` draws the label, the secondary text and the caret. Rotate the chevron in `rightSection` while the dropdown is open.

Mantine `Select` searches in the trigger itself. For the filter input at the top of the panel, build on `Combobox` with `Combobox.Search`, `Combobox.Options`, `Combobox.Group` and `Combobox.Empty`.
