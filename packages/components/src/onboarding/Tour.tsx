import { Button, Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface Coachmark {
  title: ReactNode;
  body: ReactNode;
}

export interface TourProps {
  /** The coachmarks, in order. */
  steps: Coachmark[];
  /** The active step index (controlled). */
  active: number;
  onActiveChange: (index: number) => void;
  /** Dismiss the tour (the X and the final Done both call this). */
  onClose: () => void;
  /** Where the bubble's pointer sits relative to the target. Default "top". */
  arrow?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Tour is a single coachmark bubble for a guided tour: a titled note with a
 * step counter, a Back/Next pair, a Done on the last step, and a dismiss X so
 * the user is never trapped. It is the presentation only; the consumer anchors
 * it to a target (e.g. inside a Mantine Popover) and owns the highlight. The
 * arrow prop places the pointer toward the target.
 */
export function Tour({ steps, active, onActiveChange, onClose, arrow = 'top', className }: TourProps) {
  const step = steps[active];
  if (!step) return null;
  const isLast = active === steps.length - 1;

  return (
    <div className={clsx('upmo-tour', `upmo-tour--${arrow}`, className)} role="dialog" aria-label="Tour">
      <button type="button" className="upmo-tour__close" aria-label="Dismiss tour" onClick={onClose}>
        <IconX size={14} stroke={2} />
      </button>
      <div className="upmo-tour__title">{step.title}</div>
      <div className="upmo-tour__body">{step.body}</div>
      <Group justify="space-between" mt="sm">
        <span className="upmo-tour__counter">
          {active + 1} of {steps.length}
        </span>
        <Group gap="xs">
          {active > 0 ? (
            <Button size="xs" variant="subtle" onClick={() => onActiveChange(active - 1)}>
              Back
            </Button>
          ) : null}
          {isLast ? (
            <Button size="xs" onClick={onClose}>
              Done
            </Button>
          ) : (
            <Button size="xs" onClick={() => onActiveChange(active + 1)}>
              Next
            </Button>
          )}
        </Group>
      </Group>
    </div>
  );
}
