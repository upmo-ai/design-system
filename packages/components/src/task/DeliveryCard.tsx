import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil, IconSend } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface DeliveryCardProps {
  /** Where the result goes, e.g. "#finance on Slack". */
  channel: ReactNode;
  /** When it is delivered, e.g. "After the task is done". */
  when: ReactNode;
  /** The channel icon. Defaults to a send glyph. */
  icon?: ReactNode;
  /** Edit handler; shows the pencil (aria "Change delivery channel") when set. */
  onEdit?: () => void;
  className?: string;
}

/**
 * DeliveryCard states where and when a task's result will be delivered: a
 * channel (e.g. a Slack channel or an email) and a timing. It names the delivery
 * target, not the artifact itself (artifacts are viewed in ArtifactViewer).
 * This makes "where does the work go" explicit, part of "yours, visibly".
 */
export function DeliveryCard({ channel, when, icon, onEdit, className }: DeliveryCardProps) {
  return (
    <div className={clsx('upmo-delivery', className)}>
      <div className="upmo-delivery__head">
        <h4 className="upmo-delivery__title">Delivery</h4>
        {onEdit ? (
          <Tooltip label="Edit" position="bottom" openDelay={400} withinPortal>
            <ActionIcon
              variant="subtle"
              aria-label="Change delivery channel"
              className="upmo-icon-button"
              onClick={onEdit}
            >
              <IconPencil size={15} stroke={1.75} />
            </ActionIcon>
          </Tooltip>
        ) : null}
      </div>
      <div className="upmo-delivery__body">
        <span className="upmo-delivery__icon" aria-hidden="true">
          {icon ?? <IconSend size={16} stroke={1.75} />}
        </span>
        <div className="upmo-delivery__text">
          <span className="upmo-delivery__channel">{channel}</span>
          <span className="upmo-delivery__when">{when}</span>
        </div>
      </div>
    </div>
  );
}
