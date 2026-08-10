import { Group } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClock, IconShieldCheck, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { useId, type ReactNode } from 'react';
import { Button } from '../Button/Button.tsx';

export type ApprovalState = 'pending' | 'approved' | 'denied' | 'expired';

export interface ApprovalCardProps {
  /** The action awaiting approval, shown as the title, e.g. "Send the daily digest". */
  action: ReactNode;
  /**
   * The helper sentence under the action while pending. Default "Approve to
   * continue, deny to let the agent find another way."
   */
  description?: ReactNode;
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
  /**
   * Where the approval is in its lifecycle. Once decided or expired the buttons
   * give way to the outcome (icon + word). Default "pending".
   */
  state?: ApprovalState;
  /** Who decided, shown in the outcome, e.g. "Sam" reads "Approved by Sam". */
  decidedBy?: ReactNode;
  /** When it was decided or expired, shown in the outcome, e.g. "10:42". */
  decidedAt?: ReactNode;
  /** What the action is expected to cost, e.g. "Estimated cost $0.40". */
  cost?: ReactNode;
  /** Extra context between the prompt and the actions (e.g. a diff or preview). */
  children?: ReactNode;
  /** Show progress on Approve and disable Deny while a request runs. */
  busy?: boolean;
  className?: string;
}

const outcome: Record<Exclude<ApprovalState, 'pending'>, { word: string; Icon: typeof IconCheck; tone: string }> = {
  approved: { word: 'Approved', Icon: IconCheck, tone: 'upmo-tone-positive' },
  denied: { word: 'Denied', Icon: IconX, tone: 'upmo-tone-neutral' },
  expired: { word: 'Expired', Icon: IconClock, tone: 'upmo-tone-neutral' },
};

/**
 * ApprovalCard is "autonomy with a hand on the wheel": the agent pauses and asks
 * before an action, naming the action and offering Approve or Deny. By default
 * it is attention-toned (the agent wants a decision); mark it destructive to
 * turn it critical when the action is irreversible or costly. Approve is the
 * primary action; Deny is a quiet default, since denying is always safe.
 *
 * An approval has a lifecycle: once approved, denied or expired, the card keeps
 * the record (who and when) in place of the buttons. It is a labelled group, not
 * an alert, so a list of pending approvals does not interrupt a screen reader.
 */
export function ApprovalCard({
  action,
  description = 'Approve to continue, deny to let the agent find another way.',
  onApprove,
  onDeny,
  approveLabel = 'Approve',
  denyLabel = 'Deny',
  destructive,
  state = 'pending',
  decidedBy,
  decidedAt,
  cost,
  children,
  busy,
  className,
}: ApprovalCardProps) {
  const titleId = useId();
  const decided = state === 'pending' ? null : outcome[state];
  const Icon = decided ? decided.Icon : destructive ? IconAlertTriangle : IconShieldCheck;
  const tone = decided ? decided.tone : destructive ? 'upmo-tone-critical' : 'upmo-tone-attention';

  return (
    <div
      className={clsx('upmo-approval', tone, className)}
      role="group"
      aria-labelledby={titleId}
      data-state={state}
    >
      <span className="upmo-approval__icon" aria-hidden="true">
        <Icon size={16} stroke={2} />
      </span>
      <div className="upmo-approval__body">
        <div className="upmo-approval__title" id={titleId}>
          {action}
        </div>
        {!decided && description ? <div className="upmo-approval__description">{description}</div> : null}
        {children ? <div className="upmo-approval__extra">{children}</div> : null}
        {cost ? <div className="upmo-approval__cost">{cost}</div> : null}
        {decided ? (
          <div className="upmo-approval__outcome">
            <decided.Icon size={14} stroke={2} aria-hidden="true" />
            <span>
              {decided.word}
              {decidedBy ? <> by {decidedBy}</> : null}
              {decidedAt ? <> at {decidedAt}</> : null}
            </span>
          </div>
        ) : (
          <Group gap="xs" mt="xs">
            <Button
              type="button"
              size="sm"
              color={destructive ? 'red' : undefined}
              onClick={onApprove}
              loading={busy}
            >
              {approveLabel}
            </Button>
            <Button type="button" size="sm" variant="default" onClick={onDeny} disabled={busy}>
              {denyLabel}
            </Button>
          </Group>
        )}
      </div>
    </div>
  );
}
