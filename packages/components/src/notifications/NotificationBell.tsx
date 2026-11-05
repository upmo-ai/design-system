import { Popover, Title, VisuallyHidden, type PopoverProps } from '@mantine/core';
import clsx from 'clsx';
import { Children, useId, type ReactNode } from 'react';
import { Badge } from '../Badge/Badge.tsx';
import { EmptyState } from '../EmptyState/EmptyState.tsx';
import { Icon } from '../icon/Icon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';
import { Spinner } from '../Spinner/Spinner.tsx';

export interface NotificationBellProps {
  /** The unread count. */
  count: number;
  /** The base name and the tooltip. Default "Notifications". */
  label?: string;
  /**
   * The accessible name of the bell while `count` is above zero. Default
   * (n) => `${label}, ${n} unread`. The count is how a screen reader learns
   * there is something new, so the name always carries the exact number.
   */
  unreadLabel?: (count: number) => string;
  /** The largest count the badge shows; above it the badge reads "99+". The name keeps the exact count. Default 99. */
  max?: number;
  /** The heading of the popover, which also names the dialog. Default `label`. */
  heading?: ReactNode;
  /**
   * The semantic level of the heading, an h2 to h5. The default empty state
   * sits one level below it, so an h6 heading is not offered. Default 2.
   */
  headingLevel?: 2 | 3 | 4 | 5;
  /** NotificationItem elements, newest first. */
  children?: ReactNode;
  /**
   * Shown when there are no items. Default: a compact EmptyState reading "You
   * are all caught up", with "Nothing needs your attention." under it.
   */
  empty?: ReactNode;
  /**
   * The list is loading: shows a spinner beside the heading. With no items yet,
   * it also sets aria-busy on the popover and the empty state waits until
   * loading has finished. Once items are listed they stay readable, so
   * aria-busy is not set. Default false.
   */
  busy?: boolean;
  /** The accessible name of the spinner shown while `busy`. Default "Loading". */
  loadingLabel?: string;
  /** Whether the popover is open (controlled). */
  opened?: boolean;
  /** Whether the popover starts open (uncontrolled). */
  defaultOpened?: boolean;
  /** Called when the popover opens or closes. */
  onOpenedChange?: (opened: boolean) => void;
  /** The popover width. Default 320. */
  width?: number | string;
  /** Where the popover sits against the bell. Default "bottom-end". */
  position?: PopoverProps['position'];
  className?: string;
}

/**
 * NotificationBell is the bell button of the app's top bar and the popover list
 * it opens. The bell shows an unread badge and carries the count in its
 * accessible name ("Notifications, 4 unread"); it does not announce new
 * notifications by itself. The popover is a dialog named by its heading, with
 * the items in a list. Focus moves to the heading on open, not to the first
 * control, so a key held down on the bell cannot press an action inside; Escape
 * closes it, and focus returns to the bell.
 */
export function NotificationBell({
  count,
  label = 'Notifications',
  unreadLabel = (n) => `${label}, ${n} unread`,
  max = 99,
  heading,
  headingLevel = 2,
  children,
  empty,
  busy = false,
  loadingLabel = 'Loading',
  opened,
  defaultOpened,
  onOpenedChange,
  width = 320,
  position = 'bottom-end',
  className,
}: NotificationBellProps) {
  const headingId = useId();
  const unread = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const name = unread > 0 ? unreadLabel(unread) : label;
  const hasItems = Children.toArray(children).length > 0;

  return (
    <Popover
      opened={opened}
      defaultOpened={defaultOpened}
      onChange={onOpenedChange}
      width={width}
      position={position}
      shadow="md"
      trapFocus
      returnFocus
      closeOnEscape
      withinPortal
    >
      <Popover.Target>
        <IconButton
          aria-label={name}
          tooltip={label}
          size="lg"
          className={clsx('upmo-notification-bell', className)}
          // Popover.Target wires the toggle itself only when uncontrolled.
          onClick={opened === undefined ? undefined : () => onOpenedChange?.(!opened)}
        >
          <Icon concept="nav.notifications" />
          {unread > 0 ? (
            <Badge
              size="xs"
              color="red"
              variant="filled"
              className="upmo-notification-bell__badge"
              aria-hidden="true"
            >
              {unread > max ? `${max}+` : unread}
            </Badge>
          ) : null}
        </IconButton>
      </Popover.Target>
      {/* The default label points at the bell; the heading is the better name. */}
      <Popover.Dropdown
        aria-labelledby={headingId}
        aria-busy={(busy && !hasItems) || undefined}
        className="upmo-notification-bell__dropdown"
      >
        <div className="upmo-notification-bell__head">
          {/* Focus lands here on open: the first tabbable control may be an Approve button. */}
          <Title order={headingLevel} size="h4" id={headingId} tabIndex={-1} data-autofocus>
            {heading ?? label}
          </Title>
          {busy ? <Spinner size="xs" role="img" label={loadingLabel} /> : null}
        </div>
        {hasItems ? (
          <ul className="upmo-notification-bell__list" aria-labelledby={headingId}>
            {children}
          </ul>
        ) : busy ? null : (
          (empty ?? (
            <EmptyState
              compact
              headingLevel={(headingLevel + 1) as 3 | 4 | 5 | 6}
              title="You are all caught up"
              description="Nothing needs your attention."
            />
          ))
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

export interface NotificationItemProps {
  /** What happened, in one line. */
  title: ReactNode;
  /** A quiet line under the title, e.g. the agent and the time. */
  meta?: ReactNode;
  /** An icon element, decorative. */
  icon?: ReactNode;
  /** An action for the item, e.g. a Button. To ask for a decision, put an ApprovalCard in `children`. */
  action?: ReactNode;
  /** The item has not been seen. It gets a marker and a hidden prefix for assistive tech. Default false. */
  unread?: boolean;
  /**
   * The text read before the title of an unread item, separator included.
   * Default "Unread: ". Set it for other languages (for example "Ungelesen: ").
   */
  unreadLabel?: string;
  /** Extra content under the meta line, e.g. an ApprovalCard. */
  children?: ReactNode;
}

/**
 * NotificationItem is one entry of a NotificationBell list: an optional icon, a
 * title with a quiet meta line, optional content (such as an ApprovalCard) and
 * an optional action. Unread items carry a marker that never depends on colour
 * alone, and are read as "Unread".
 */
export function NotificationItem({
  title,
  meta,
  icon,
  action,
  unread = false,
  unreadLabel = 'Unread: ',
  children,
}: NotificationItemProps) {
  return (
    <li className={clsx('upmo-notification-item', unread && 'upmo-notification-item--unread')}>
      {icon ? (
        <span className="upmo-notification-item__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="upmo-notification-item__body">
        <div className="upmo-notification-item__title">
          {unread ? <VisuallyHidden>{unreadLabel}</VisuallyHidden> : null}
          {title}
        </div>
        {meta ? <div className="upmo-notification-item__meta">{meta}</div> : null}
        {children ? <div className="upmo-notification-item__extra">{children}</div> : null}
        {action ? <div className="upmo-notification-item__action">{action}</div> : null}
      </div>
      {unread ? <span className="upmo-notification-item__dot" aria-hidden="true" /> : null}
    </li>
  );
}
