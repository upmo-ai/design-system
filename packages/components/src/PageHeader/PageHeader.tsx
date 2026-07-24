import { Group, Stack, Text, Title } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  /** The page title. One per page, rendered as the h1. */
  title: ReactNode;
  /** A short supporting line under the title. */
  description?: ReactNode;
  /** Right-aligned actions (search, a primary button). One primary per region. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The standard page header: an h1 title with an optional description on the
 * left, and right-aligned actions. Matches the product's inline pattern (Group
 * space-between, Stack title + dimmed description, actions group), extracted so
 * every page frames the same way.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <Group
      justify="space-between"
      align="center"
      wrap="wrap"
      gap="md"
      className={clsx('upmo-page-header', className)}
    >
      <Stack gap={4}>
        <Title order={1}>{title}</Title>
        {description ? (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        ) : null}
      </Stack>
      {actions ? (
        <Group gap="sm" wrap="wrap">
          {actions}
        </Group>
      ) : null}
    </Group>
  );
}
