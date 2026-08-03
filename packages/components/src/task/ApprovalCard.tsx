import { Button, Group } from '@mantine/core';
import { IconAlertTriangle, IconShieldCheck } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface ApprovalCardProps {
  /** The action awaiting approval, as a sentence, e.g. "Send the daily digest". */
  action: ReactNode;
  /** Approve handler. */
  onApprove: () => void;
  /** Deny handler. */
  onDeny: () => void;
  /** Approve button label. Default "Approve". */
  approveLabel?: string;
  /** Deny button label. Default "Deny". */
  denyLabel?: string;
  /**
   * Mark the pending action as destructive (irreversible or costly). The card
   * turns critical (red) and the Approve button turns red, so the weight of the
   * decision is visible. Copy should still name the consequence; colour is never
   * the sole signal. Default false (an attention-toned card).
   */
  destructive?: boolean;
  /** Extra context between the prompt and the actions (e.g. a diff or preview). */
  children?: ReactNode;
  /** Disable both buttons while a request runs. */
  busy?: boolean;
  className?: string;
}

/**
 * ApprovalCard is "autonomy with a hand on the wheel": the agent pauses and asks
 * before an action, naming the action and offering Approve or Deny. By default
 * it is attention-toned (the agent wants a decision); mark it destructive to
 * turn it critical when the action is irreversible or costly. Approve is the
 * primary action; Deny is a quiet default, since denying is always safe.
 */
export function ApprovalCard({
  action,
  onApprove,
  onDeny,
  approveLabel = 'Approve',
  denyLabel = 'Deny',
  destructive,
  children,
  busy,
  className,
}: ApprovalCardProps) {
  const Icon = destructive ? IconAlertTriangle : IconShieldCheck;

  return (
    <div
      className={clsx(
        'upmo-approval',
        destructive ? 'upmo-tone-critical' : 'upmo-tone-attention',
        className,
      )}
      role="alert"
    >
      <span className="upmo-approval__icon" aria-hidden="true">
        <Icon size={16} stroke={2} />
      </span>
      <div className="upmo-approval__body">
        <div className="upmo-approval__title">
          {action}. Approve to continue, deny to let the agent find another way.
        </div>
        {children ? <div className="upmo-approval__extra">{children}</div> : null}
        <Group gap="xs" mt="xs">
          <Button
            type="button"
            size="sm"
            color={destructive ? 'red' : undefined}
            onClick={onApprove}
            disabled={busy}
          >
            {approveLabel}
          </Button>
          <Button type="button" size="sm" variant="default" onClick={onDeny} disabled={busy}>
            {denyLabel}
          </Button>
        </Group>
      </div>
    </div>
  );
}
