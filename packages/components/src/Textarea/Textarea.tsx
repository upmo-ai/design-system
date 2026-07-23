import { Textarea as MantineTextarea, type TextareaProps as MantineTextareaProps } from '@mantine/core';
import clsx from 'clsx';

export interface TextareaProps extends MantineTextareaProps {}

/**
 * A multi-line text input. Autosizes by default, growing to 8 rows then
 * scrolling (the forms spec), with the Upmo control feel.
 */
export function Textarea({ classNames, autosize, maxRows, minRows, ...rest }: TextareaProps) {
  return (
    <MantineTextarea
      autosize={autosize ?? true}
      minRows={minRows ?? 3}
      maxRows={maxRows ?? 8}
      {...rest}
      classNames={{ ...classNames, input: clsx('upmo-input', (classNames as Record<string, string>)?.input) }}
    />
  );
}
