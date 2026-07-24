import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Heading. One short line. */
  title: ReactNode;
  /** Supporting sentence: what belongs here and how to add it. */
  description?: ReactNode;
  /** An icon element (e.g. a Tabler icon or the caret). Rendered in a soft tile. */
  icon?: ReactNode;
  /** A single primary action (usually a Button). One per empty state. */
  action?: ReactNode;
  /** Draw the dashed first-run border to invite the first action. */
  firstRun?: boolean;
  className?: string;
}

/**
 * EmptyState fills a region that has no content yet: an icon tile, a title, a
 * supporting line, and at most one primary action. With `firstRun`, it shows a
 * dashed border to invite the first step.
 */
export function EmptyState({ title, description, icon, action, firstRun, className }: EmptyStateProps) {
  return (
    <Stack
      align="center"
      gap="xs"
      py={48}
      px="md"
      w="100%"
      className={clsx('upmo-empty-state', firstRun && 'upmo-empty-state--first-run', className)}
    >
      {icon ? (
        <ThemeIcon variant="light" size={48} radius="lg" aria-hidden>
          {icon}
        </ThemeIcon>
      ) : null}
      <Title order={3}>{title}</Title>
      {description ? (
        <Text c="dimmed" maw={360} ta="center">
          {description}
        </Text>
      ) : null}
      {action ? <div style={{ marginTop: 'var(--space-2)' }}>{action}</div> : null}
    </Stack>
  );
}
