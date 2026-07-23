import { Checkbox as MantineCheckbox, type CheckboxProps } from '@mantine/core';

export type { CheckboxProps };

/**
 * A checkbox. For "on or off, takes effect on submit" and for "several of a
 * few" (as a group). Sharp 2px box from the theme. An icon-only checkbox in a
 * table cell should carry an `aria-label`.
 */
export const Checkbox = MantineCheckbox;
