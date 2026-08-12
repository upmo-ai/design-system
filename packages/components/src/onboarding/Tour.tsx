import { Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../Button/Button.tsx';
import { Icon } from '../icon/Icon.tsx';

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
  /** Dismiss the tour (the X, the final Done and Escape all call this). */
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
 *
 * It is a non-modal dialog named by its step title and described by its body.
 * Focus moves into it when it opens and on each step, but is not trapped;
 * Escape dismisses it.
 */
export function Tour({ steps, active, onActiveChange, onClose, arrow = 'top', className }: TourProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    ref.current?.focus();
  }, [active]);

  const step = steps[active];
  if (!step) return null;
  const isLast = active === steps.length - 1;

  return (
    <div
      ref={ref}
      className={clsx('upmo-tour', `upmo-tour--${arrow}`, className)}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-body`}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <button type="button" className="upmo-tour__close" aria-label="Dismiss tour" onClick={onClose}>
        <IconX size={14} stroke={2} />
      </button>
      <div className="upmo-tour__title" id={`${id}-title`}>
        {step.title}
      </div>
      <div className="upmo-tour__body" id={`${id}-body`}>
        {step.body}
      </div>
      <Group justify="space-between" mt="sm">
        <span className="upmo-tour__counter">
          {active + 1} of {steps.length}
        </span>
        <Group gap="xs">
          {active > 0 ? (
            <Button
              size="xs"
              variant="subtle"
              onClick={() => onActiveChange(active - 1)}
              leftSection={<Icon concept="action.previous" size={14} />}
            >
              Back
            </Button>
          ) : null}
          {isLast ? (
            <Button size="xs" onClick={onClose} leftSection={<Icon concept="action.approve" size={14} />}>
              Done
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={() => onActiveChange(active + 1)}
              rightSection={<Icon concept="action.next" size={14} />}
            >
              Next
            </Button>
          )}
        </Group>
      </Group>
    </div>
  );
}
