import { Badge, type BadgeProps } from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconPlayerPause,
  IconShieldCheck,
  IconSquare,
  IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Caret } from './Caret.tsx';
import { type Status, type Tone, statusMeta } from './status.ts';

const toneClass: Record<Tone, string> = {
  neutral: 'upmo-tone-neutral',
  active: 'upmo-tone-active',
  positive: 'upmo-tone-positive',
  attention: 'upmo-tone-attention',
  critical: 'upmo-tone-critical',
};

const icons = {
  check: IconCheck,
  x: IconX,
  clock: IconClock,
  shield: IconShieldCheck,
  pause: IconPlayerPause,
  stop: IconSquare,
} as const;

export interface StatusBadgeProps extends Omit<BadgeProps, 'color' | 'leftSection' | 'variant'> {
  /** A Phase or Attention status word. Drives the tone, the mark, and the label. */
  status: Status;
}

/**
 * StatusBadge renders an Upmo status (Phase or Attention) as a pill: the tone
 * ground and text from the token-backed tone, a mark (the live caret for
 * Working/Checking, a familiar icon otherwise), and the status word. Colour is
 * never alone: the word and the mark always accompany it.
 */
export function StatusBadge({ status, className, ...rest }: StatusBadgeProps) {
  const meta = statusMeta(status);
  const iconSize = 13;

  let mark: ReactNode;
  if (meta.mark === 'icon' && meta.icon) {
    const Icon = icons[meta.icon];
    mark = <Icon size={iconSize} stroke={2.2} aria-hidden="true" />;
  } else if (meta.mark !== 'icon') {
    mark = <Caret mark={meta.mark} size={iconSize} />;
  }

  return (
    <Badge
      component="span"
      variant="light"
      tt="none"
      className={clsx('upmo-status-badge', toneClass[meta.tone], className)}
      leftSection={mark}
      {...rest}
    >
      {status}
    </Badge>
  );
}
