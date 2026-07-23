import { Radio as MantineRadio } from '@mantine/core';

export type { RadioProps, RadioGroupProps } from '@mantine/core';

/**
 * A radio button, used inside `Radio.Group` for "one of up to ~5 options".
 * Each Radio takes `value`, `label`, and an optional `description`.
 * Re-exported with the Upmo theme defaults; `Radio.Group` is available as
 * `Radio.Group`.
 */
export const Radio = MantineRadio;
