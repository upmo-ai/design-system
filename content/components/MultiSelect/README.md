# MultiSelect

Several values from a long list, shown as pills inside the field and filtered as you type.

## When to use

- Knowledge folders, tools, recipients and tags from a list of ten or more.
- Up to about eight options: use a `Checkbox` group or a `Chip` group.

## What the consumer provides

- `label`, `description`, and a `placeholder` written as an instruction ("Add a folder…").
- `data`: `{ value, label, description?, group?, disabled? }[]`. `description` is short text on the right of the row, such as "42 docs".
- `value` (an array) and `onChange`.
- `maxValues` when the backend has a limit. The field description then says "3 of 5".

## Behaviour

- It uses the markup, styles and script of `Select`, with `aria-multiselectable` on the list. The differences are below.
- The native `select multiple` element is not used.
- The field is a `TextInput` that grows with the pills. The filter input sits after the last pill. The focus ring goes around the whole field.
- Pills are 28px, `radius-full`, with a `surface-selected` ground and `emerald-deep` text. Each pill has a remove button with the `x` icon.
- A click on the field or typing opens the list. Typing filters it. With no match, the panel says "No matches".
- Enter or a click toggles the active option. The list stays open so you can pick more. Each pick clears the filter.
- Chosen options stay in the list with `emerald-deep` text and the caret, so you can untick them there too.
- Backspace in an empty filter removes the last pill.
- Escape, Tab and a click outside close the list. The panel and its motion are the same as in `Select`.

## Keyboard

- ArrowDown and ArrowUp open the list. When it is open, they move one row. Home and End jump to the first and last row while the filter is empty.
- Enter toggles the active option. Backspace in an empty filter removes the last pill. Escape closes.
- The remove buttons are not in the tab order. Use Backspace, or untick the option in the list.

## Accessibility

- The filter input has `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`.
- The list has `role="listbox"` and `aria-multiselectable="true"`. Each row has `role="option"` and `aria-selected`.
- Each remove button has an `aria-label`, such as "Remove finance-policies".

## Tokens

As `Select`, plus `surface-selected` and `radius-full` for the pills.

## Mantine

`<MultiSelect data searchable hidePickedOptions={false} checkIconPosition="right" nothingFoundMessage="No matches" />` with `classNames={{ input: 'u-input u-select-trigger u-select-trigger--multi', pill: 'u-pill', dropdown: 'u-select-drop', option: 'u-opt' }}`, and the same `comboboxProps` and `renderOption` as `Select`. Use `TagsInput` for free text.
