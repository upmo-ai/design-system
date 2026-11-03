import { Alert } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon, type IconConcept } from '../icon/Icon.tsx';
import type { Tone } from '../status/status.ts';

/** The four alert tones. `info` is the neutral tone, which reads info-blue. */
export type StatusAlertTone = 'info' | 'positive' | 'attention' | 'critical';

export interface StatusAlertProps {
  /** The tone. Default 'info'. */
  tone?: StatusAlertTone;
  /** A short bold line above the message. */
  title?: ReactNode;
  /** The message. */
  children: ReactNode;
  /** Replaces the tone's default icon. The icon is decorative. */
  icon?: ReactNode;
  /** Actions under the message (one or two Buttons, usually size "xs"). */
  actions?: ReactNode;
  /** Shows a close button that calls this. The caller removes the alert. */
  onDismiss?: () => void;
  /** The close button's accessible name. Default "Dismiss". */
  dismissLabel?: string;
  /**
   * The live-region role. Default: 'alert' for critical (announced at once),
   * 'status' for the others (announced politely).
   */
  role?: 'alert' | 'status';
  className?: string;
}

const tones: Record<StatusAlertTone, { tone: Tone; concept: IconConcept }> = {
  info: { tone: 'neutral', concept: 'status.info' },
  positive: { tone: 'positive', concept: 'status.done' },
  attention: { tone: 'attention', concept: 'status.warning' },
  critical: { tone: 'critical', concept: 'status.danger' },
};

/**
 * StatusAlert is an inline message for a region or page: a tone edge and icon,
 * an optional title, the message, optional actions, and an optional labelled
 * close button. Tones map onto the status tone layer (info is the neutral,
 * info-blue tone). Colour is never the sole signal: every tone carries its own
 * icon, and the message carries the meaning in words. Critical alerts use
 * role="alert"; the others role="status", so they are announced politely.
 * Wraps Mantine Alert.
 */
export function StatusAlert({
  tone = 'info',
  title,
  children,
  icon,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  role,
  className,
}: StatusAlertProps) {
  const meta = tones[tone];
  return (
    <Alert
      variant="default"
      role={role ?? (tone === 'critical' ? 'alert' : 'status')}
      title={title}
      icon={icon ?? <Icon concept={meta.concept} size={18} />}
      withCloseButton={Boolean(onDismiss)}
      closeButtonLabel={dismissLabel}
      onClose={onDismiss}
      data-tone={tone}
      className={clsx('upmo-status-alert', `upmo-tone-${meta.tone}`, className)}
      classNames={{
        icon: 'upmo-status-alert__icon',
        title: 'upmo-status-alert__title',
        message: 'upmo-status-alert__message',
        closeButton: 'upmo-status-alert__close',
      }}
    >
      {children}
      {actions ? <div className="upmo-status-alert__actions">{actions}</div> : null}
    </Alert>
  );
}
