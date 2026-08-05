import { TagsInput, type TagsInputProps } from '@mantine/core';
import clsx from 'clsx';

export interface TagInputProps extends TagsInputProps {}

/**
 * TagInput is a searchable multi-select that collects values as removable chips:
 * type to search or add, Enter to commit, and each selection shows as a bordered
 * emerald chip with a remove affordance. For "pick several, with free entry"
 * (interests, labels, recipients). Wraps Mantine TagsInput with the Upmo look
 * and the shared emerald focus borderline.
 */
export function TagInput({ classNames, ...rest }: TagInputProps) {
  return (
    <TagsInput
      {...rest}
      classNames={{
        ...classNames,
        input: clsx('upmo-input', (classNames as Record<string, string>)?.input),
        pill: clsx('upmo-tag-pill', (classNames as Record<string, string>)?.pill),
      }}
    />
  );
}
