import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import type { ElementType, ReactNode } from 'react';

// Anchor is polymorphic with a very large prop union; for a data-driven crumb
// with an optional runtime `component`, treat it as a loose element to avoid
// the overload explosion while keeping our own BreadcrumbItem types strict.
const LinkCrumb = Anchor as unknown as (props: Record<string, unknown>) => ReactNode;

export interface BreadcrumbItem {
  label: ReactNode;
  /** Href for a link crumb. Omit for the current (last) crumb. */
  href?: string;
  /** Polymorphic component for router links (e.g. TanStack Router Link). */
  component?: ElementType;
  /** Extra props forwarded to the link component (e.g. `to`). */
  linkProps?: Record<string, unknown>;
}

export interface BreadcrumbsProps {
  /** The trail, root first. The last item renders as the current page. */
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * A breadcrumb trail. Interior crumbs are links; the last is the current page,
 * bold and marked `aria-current="page"`. Separator is "/".
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <MantineBreadcrumbs separator="/" className={className}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (isLast) {
          return (
            <Text key={i} size="sm" fw={600} aria-current="page">
              {item.label}
            </Text>
          );
        }
        return (
          <LinkCrumb
            key={i}
            size="sm"
            {...(item.component ? { component: item.component } : { href: item.href })}
            {...(item.linkProps ?? {})}
          >
            {item.label}
          </LinkCrumb>
        );
      })}
    </MantineBreadcrumbs>
  );
}
