# DateInput

A date or time field that takes a typed value or a pick from a calendar, and always shows the user's timezone.

## When to use

- Use it for schedules, deadlines and report ranges. Recurring schedules use `Select` presets first, with a cron field behind "Custom".

## What the consumer provides

- `label`, a `description` with the timezone ("Europe/Amsterdam"), `value`, `onChange` and `minDate`/`maxDate`.
- `valueFormat` "D MMM YYYY". Times use 24h with 5-minute steps, unless the locale says otherwise.
- For ranges, use two fields or a range calendar. The chosen span shows on `surface-selected`.

## Behaviour

- The field accepts typed text and reads it ("tomorrow", "20 oct"). The calendar opens on the icon or on focus. It uses `surface-100`, `border`, `shadow-sm` and `radius-lg`.
- Days are 34px buttons. Today has a `border-strong` ring. The chosen day fills `emerald-deep`. Disabled days are `ink-disabled` and say why on hover.
- Arrow keys move by day and PageUp/PageDown by month. Enter picks and Escape closes.

## Tokens

As `TextInput`, plus `emerald-deep`, `ink-on-brand`, `surface-selected`, `border-strong`, `ink-disabled`, `shadow-sm`, `radius-lg`, `radius-sm`.

## Mantine

`@mantine/dates`: `<DateInput valueFormat="D MMM YYYY" minDate popoverProps={{ shadow: 'sm', radius: 'lg' }} />`, `<TimeInput />`, `<DatePickerInput type="range" />`.
