import { Switch as MantineSwitch, type SwitchProps } from '@mantine/core';

export type { SwitchProps };

/**
 * A switch. For "on or off, takes effect at once" (the forms spec). Prefer a
 * Checkbox for on/off that takes effect on submit. Themed to the emerald
 * primary. Carries a label or an aria-label.
 */
export const Switch = MantineSwitch;
