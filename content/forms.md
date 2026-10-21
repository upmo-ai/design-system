# Forms

Forms are where Upmo asks people for things it cannot know: a provider key, a repository, a schedule, a goal. A form responds on every keystroke. It never lets a mistake survive past the next step. A wrong key caught here is a failed task that never happens.

## Anatomy of a field

1. **Label** (`label` style, `ink`) sits above the control and is always visible. Add "(optional)" after the label when the field is optional. Required is the default and needs no mark. If a form mixes both, mark the required fields with "(required)".
2. **Control** at `control-md` height, with a `surface-100` ground, a `border-strong` edge and `radius-md`. Text is `body`. The placeholder is `ink-muted` and shows an example of the format. It never replaces the label.
3. **Description** (`body-sm`, `ink-muted`) sits under the control, before any error. It says what the value is for or where to find it.
4. **Message** (`body-sm`) sits under the description. It is `danger` with the X icon when the value is invalid. It is `success` with the caret when a check passed: a key that connected, a repository that was found. Both link to the control with `aria-describedby`.

## Reactive behaviour

- **Focus.** `border-strong` becomes `emerald-deep`, and the `focus` ring appears on keyboard focus. 120ms.
- **Typing.** Character counters update live. Format masks shape the input as you type, for dates and cron schedules. A field that changes the input (trims it, or lowercases a handle) shows the result on blur, when you leave the field.
- **Validation timing.** Validate first on blur. After a field has been invalid, validate on every input, so the error goes away the moment it is fixed. Never show an error on a field the user has not touched, except on submit.
- **Async checks.** These checks wait for a server, such as "Test connection" and "Find repository". The control shows the draw caret inline. The button reads "Testing…" with `aria-busy`. The result appears in the message line with its icon. Keep the field editable while the check runs.
- **Submit.** The primary button shows the draw caret and keeps its width. On success, a `Notification` confirms it ("Provider connected"), and the form closes or resets. On failure, focus moves to the first invalid field. An `Alert` with `role="alert"` sums up the errors.
- **Dirty state.** A form is dirty when it has unsaved changes. Leaving a dirty form opens a `Modal` that asks first. "Discard changes" is the danger action. "Keep editing" is the safe default.

## Control choice

| Need | Use |
| --- | --- |
| Short text, one line | `TextInput` |
| Secret | `TextInput` type password with a reveal toggle |
| Long text, instructions, goals | `Textarea`, growing to 8 lines, then scrolling |
| One of up to 5 options | `Radio` group, or `SegmentedControl` when the options are short words |
| One of 6 or more | `Select`, with search above 10 |
| Several of a few | `Checkbox` group |
| Several of many | `Chip` group, or a multi-select with chips |
| On or off, takes effect at once | `Switch` |
| On or off, takes effect on submit | `Checkbox` |
| Numbers | `TextInput` with `inputmode="numeric"` and a unit suffix |
| Dates and times | Mantine `DateInput` and `TimeInput`, with the user's timezone shown |

## Layout

- On phones, fields stack in one column with `space-4` gaps. From `bp-xs`, related short fields go two across, with `space-3` between them: first and last name, host and port.
- Sections are `space-6` apart. Each starts with an `h3` and one line of `body-sm` text.
- The actions row sits at the end. On desktop it is right-aligned. The primary comes last. On phones the buttons stack at full width, with the primary on top. Destructive actions sit on the left, apart from the rest.
- Labels never sit beside the control. They always sit above it, so the eye moves in one direction.

## Long forms: steps

Split a form into steps when it has more than about seven fields. Also split it when later fields depend on earlier answers: choose a provider, then its credentials, then a model.

- Use `Stepper`, with three to five steps. Each step has a short noun title: "Provider", "Credentials", "Model", "Review".
- The header shows every step with its state: done (caret, `emerald`), current (number, `emerald-deep` ring), upcoming (number, `ink-muted`). You can click a completed step to go back to it.
- Each step validates on "Continue". The user cannot move past an invalid step. The button stays enabled, so pressing it shows the errors.
- "Back" never loses data. Closing the stepper asks first only if something was entered.
- The last step is a review. It lists every answer with an "Edit" link that jumps to its step. The primary button names the outcome: "Create task", "Connect provider".
- On phones, the step header collapses to "Step 2 of 4 · Credentials" with a thin progress bar.

## Inline editing

Some settings take effect at once, such as a display name or a default model. They use inline fields with a `Switch` or an auto-save. The field shows the draw caret while the request runs. Then it shows a small `success` caret with "Saved" for 2s. Single-value settings have no "Save" button.

## Copy for forms

- Labels are nouns: "API key", "Repository", "Schedule".
- Descriptions say where to find the value: "From the OpenAI dashboard, under API keys."
- Errors say the fix: "Enter a key that starts with sk-." "Pick a repository you can push to."
- Buttons say the result: "Connect", "Create task", "Save changes". Never "Submit" or "OK".
