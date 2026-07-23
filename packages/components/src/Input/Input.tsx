import { TextInput, type TextInputProps } from '@mantine/core';
import clsx from 'clsx';

export interface InputProps extends TextInputProps {}

/**
 * A single-line text input. A Mantine TextInput with the Upmo control feel
 * (radius-md, border-strong edge, emerald focus from the theme). Accepts
 * Mantine's label/description/error props for standalone use, or spread the
 * Field control props onto it when wrapped in a Field.
 */
export function Input({ classNames, ...rest }: InputProps) {
  return (
    <TextInput
      {...rest}
      classNames={{ ...classNames, input: clsx('upmo-input', (classNames as Record<string, string>)?.input) }}
    />
  );
}
