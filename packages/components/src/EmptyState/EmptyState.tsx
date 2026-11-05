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
  /**
   * Tight padding (--space-4 block, --space-2 inline), a 32px icon tile, an
   * h4-sized title and a full-width description. Fits a 320px popover or a small
   * panel. Default false.
   */
  compact?: boolean;
  /**
   * The semantic level of the title (an h2 to h6). The visual size does not
   * change: it stays the h3 size, or the h4 size when `compact`. Default 3.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * EmptyState fills a region that has no content yet: an icon tile, a title, a
 * supporting line, and at most one primary action. With `firstRun`, it shows a
 * dashed border to invite the first step. Use `compact` inside a popover or a
 * small panel, and `headingLevel` to put the title at the right level of the
 * page outline.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  firstRun,
  compact = false,
  headingLevel = 3,
  className,
}: EmptyStateProps) {
  return (
    <Stack
      align="center"
      gap="xs"
      // The compact padding lives in the stylesheet, so it carries no style prop.
      {...(compact ? {} : { py: 48, px: 'md' })}
      w="100%"
      className={clsx(
        'upmo-empty-state',
        compact && 'upmo-empty-state--compact',
        firstRun && 'upmo-empty-state--first-run',
        className,
      )}
    >
      {icon ? (
        <ThemeIcon variant="light" size={compact ? 32 : 48} radius="lg" aria-hidden>
          {icon}
        </ThemeIcon>
      ) : null}
      <Title order={headingLevel} size={compact ? 'h4' : 'h3'}>
        {title}
      </Title>
      {description ? (
        <Text c="dimmed" ta="center" {...(compact ? { w: '100%' } : { maw: 360 })}>
          {description}
        </Text>
      ) : null}
      {action ? <div style={{ marginTop: 'var(--space-2)' }}>{action}</div> : null}
    </Stack>
  );
}
