# PageSettings

A showcase of Settings, with a section nav on the left, a providers `Table`, rows that save inline with `Select` and `Switch`, and a danger zone.

## What it demonstrates

- A 200px section nav (Providers, Routing, Sandboxes, …). The current section is on `surface-selected`, and the breadcrumb repeats it.
- Each section is an `h3` with a one-line description. `border` rules and `space-6` separate the sections.
- The providers `Table` has a status `Badge` on each row (healthy, rate limited, offline), plus a Test button and a More menu. "Add provider" is a `light sm` button in the section header.
- Setting rows put the title and description on the left and the control on the right. `Switch` rows save at once and show the state word. A locked setting is a disabled switch that says "Always".
- Danger zone: an `h3` in `danger`, a `danger-outline` button, and a description that names what will happen. Pressing the button opens a confirmation `Modal`.

## Responsive

Below `bp-sm`, the section nav becomes a row of chips above the content that scrolls sideways. Setting rows stack, with the control under the text.
