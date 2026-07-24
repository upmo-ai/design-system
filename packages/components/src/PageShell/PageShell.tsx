import { Stack } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { PageHeader, type PageHeaderProps } from '../PageHeader/PageHeader.tsx';

export interface PageShellProps {
  /** Page header props; renders a PageHeader at the top when provided. */
  header?: PageHeaderProps;
  /** The page content. */
  children: ReactNode;
  /** Constrain content to the reading measure (for prose-heavy pages). */
  narrow?: boolean;
  className?: string;
}

/**
 * PageShell is the content frame for a page: a padded, single-column region
 * with an optional PageHeader and a consistent gap between the header and the
 * content. It is the inner page frame, not the full app shell (rail, top bar,
 * command palette, global liveness), which is an agent-surface concern built
 * later.
 */
export function PageShell({ header, children, narrow, className }: PageShellProps) {
  return (
    <Stack
      gap="lg"
      className={clsx('upmo-page-shell', narrow && 'upmo-page-shell--narrow', className)}
    >
      {header ? <PageHeader {...header} /> : null}
      {children}
    </Stack>
  );
}
