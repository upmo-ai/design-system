# FormExample

A showcase page, not a component: one complete form built from the inputs, with its layout, validation and success path.

## What it demonstrates

- An `h3` title and one line of description come first. Fields follow in one column with `space-4` gaps. From `bp-xs`, two related short fields share a row.
- Labels go above the field and descriptions below it. Messages go below the descriptions.
- Submit validates every field. It shows a `danger` `Alert` with `role="alert"` that lists the fields, then moves focus to the first invalid field. Once a field has been invalid, it validates again on every input.
- While saving, the primary button keeps its width and shows the draw caret. Success arrives as a `Notification`.
- Actions sit on the right, above a `border` rule. Cancel is `subtle`. The primary names the outcome.

## Use it as

The template for Settings forms, "New automation", "New agent" and provider setup. A long form becomes a `Stepper`, with the same fields split across the steps.
