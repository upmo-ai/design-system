# Accessibility

Every Upmo surface meets WCAG 2.2 AA, the common web accessibility standard, in both themes. A component passes these checks before it ships. They exist so that everyone can follow what their agents are doing.

## Contrast

- Text meets 4.5:1 against the ground (the surface behind it) that its token note names. Large text (24px, or 19px bold) meets 3:1. Check both themes, and measure: never judge by eye.
- Control edges, focus rings, icons that carry meaning and chart marks meet 3:1 against their ground. That is why inputs use `border-strong`, not `border`.
- `emerald` is 3.9:1 on Bone. That is fine for the caret and 24px headings, but never for 15px text. Use `emerald-deep` for links and labels.
- Disabled text (`ink-disabled`) is exempt. Disabled controls still keep their label readable, through a tooltip or a helper line.
- Placeholder text is `ink-muted` (6.5:1), so it is readable. It is never the only label.

## Colour is never the only signal

- Status pairs its colour with a word or an icon: done caret, warning clock, failed X, info circle.
- In the light theme, success and danger have similar lightness. That is why the icon rule exists. A person with red-green colour blindness can still tell "Done" from "Failed".
- Links inside prose are `emerald-deep` and underlined. Links in nav and buttons have no underline. Their shape already says what they are.
- Required fields show "(required)", or an asterisk with a legend that explains it. Optional fields say "(optional)". Never a red asterisk alone.
- Charts use lightness steps and labels, not hue alone.

## Keyboard

- You can reach everything clickable with Tab. Enter or Space activates it. Escape closes it.
- Focus order follows reading order. A modal keeps focus inside it while it is open. When it closes, focus returns to the control that opened it.
- The focus ring is `focus`: 2px solid, 2px offset, on `:focus-visible` only. Never set `outline: none` without a replacement.
- Composite widgets (tabs, menus, radio groups, segmented control) are one Tab stop for the whole group. Arrow keys move inside them.
- The skip link "Skip to content" is the first focusable element on every page.
- Shortcuts appear in `Kbd`. They never need more than one modifier key.

## Pointer and touch

- Touch targets are at least 40px (`control-md`), with 8px (`space-2`) between them. That includes sidebar items. With a precise pointer (`pointer: fine`), sidebar items, table rows and toolbar controls may be 32px (`control-sm`). Inline icons have an absolute floor of 24px, with 8px of space around them (WCAG 2.5.8). Font size does not change between the two.
- Hover never hides information. Anything that appears on hover also appears on focus and on tap.
- Every drag has another way to do the same thing: buttons to reorder, or a move menu.
- Press feedback is immediate: the fill changes and the control scales to 0.98.

## Screen readers

- Use native elements first: `button`, `a`, `input`, `select`, `dialog`. Use ARIA (attributes that describe a control to assistive technology) only when a native element cannot do the job.
- Every input has a visible `label`, linked with `for`/`id`. Helper text and errors link through `aria-describedby`. Invalid fields set `aria-invalid="true"`.
- Icon-only buttons carry an `aria-label`. Every icon-only control shows that label as a `Tooltip` on hover and on keyboard focus. There are no exceptions: send, copy, dismiss, more, the rail items, table row actions. The stylesheet builds this tooltip for every `ActionIcon` from its `aria-label`. So a missing tooltip means a missing label, and the axe check (an automated accessibility test) catches it. Decorative icons carry `aria-hidden="true"`.
- Brand marks in pickers are `aria-hidden`. The service name beside them is the label.
- A live region is an area that a screen reader announces when it changes. Form errors on submit announce through `role="alert"`. Notifications announce through `role="status"`. Task status changes use a polite live region, which waits for a pause before it speaks.
- The caret loader has `role="img"` and `aria-label="Loading"`. A loading button sets `aria-busy="true"`.
- Status badges read out their word, never only their colour. The caret icon inside is `aria-hidden`.
- Tables have a `caption` or an `aria-label`, and `th` cells with `scope`. Sortable headers announce their sort state.

## Motion and timing

- Honour `prefers-reduced-motion: reduce`. Stop every loop. Show carets in their end state. Overlays only fade.
- Nothing moves on by itself or times out without a pause control. A notification that contains an action stays until the person dismisses it.
- No content flashes more than three times a second.

## Text and layout

- The page is readable at 200% zoom and at 320px CSS width, with no sideways scroll.
- Line length stays under `measure` (68ch). Body text has a line height of at least 1.4.
- Set the language on `html`. Headings nest without skipping a level.
- There is no text inside images. The wordmark SVG carries `role="img"` and `aria-label="Upmo"`.

## Forms

- Validate on blur (when the person leaves the field) and on submit. Never validate on every keystroke before they have left the field. Once a field has been invalid, check it again on every input. Then the error clears as soon as it is fixed.
- The error sits under the field, in `danger` with the X icon. It names the fix.
- If a submit has errors, focus moves to the first invalid field. A summary with `role="alert"` lists the errors, with links to each field.
- Multi-step forms announce "Step 2 of 4, Provider" when the step changes. Completed steps stay reachable.

## Testing

- Every component preview is checked with the keyboard only, with the VoiceOver and NVDA screen readers, in both themes and at 200% zoom.
- Automated checks: axe in the web test suite, and contrast assertions against `tokens.json`.
