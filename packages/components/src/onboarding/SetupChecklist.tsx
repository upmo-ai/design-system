import { Button, Progress } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface ChecklistStep {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  done?: boolean;
  /** The CTA label for an incomplete step. */
  actionLabel?: string;
  onAction?: () => void;
}

export interface SetupChecklistProps {
  /** The heading, e.g. "Finish setting up Upmo". */
  title?: ReactNode;
  steps: ChecklistStep[];
  className?: string;
}

/**
 * SetupChecklist is the first-run setup list: an ordered set of steps with a
 * completion bar, each step showing done (an emerald check) or an action to
 * complete it. It is the "retained floor" of onboarding, always showing how far
 * along setup is and the single next action, never nagging.
 */
export function SetupChecklist({ title = 'Finish setting up', steps, className }: SetupChecklistProps) {
  const doneCount = steps.filter((s) => s.done).length;
  const percent = steps.length ? (doneCount / steps.length) * 100 : 0;
  const allDone = doneCount === steps.length;

  return (
    <div className={clsx('upmo-checklist', className)}>
      <div className="upmo-checklist__head">
        <h3 className="upmo-checklist__title">{title}</h3>
        <span className="upmo-checklist__progress-label">
          {doneCount} of {steps.length} done
        </span>
      </div>
      <Progress
        value={percent}
        color={allDone ? 'emerald' : 'emerald'}
        size="sm"
        aria-label="Setup progress"
        mb="md"
      />
      <ol className="upmo-checklist__list">
        {steps.map((step) => (
          <li
            key={step.id}
            className={clsx('upmo-checklist__item', step.done && 'upmo-checklist__item--done')}
          >
            <span
              className={clsx('upmo-checklist__mark', step.done && 'upmo-checklist__mark--done')}
              aria-hidden="true"
            >
              {step.done ? <IconCheck size={13} stroke={2.6} /> : null}
            </span>
            <div className="upmo-checklist__body">
              <div className="upmo-checklist__item-title">{step.title}</div>
              {step.description ? (
                <div className="upmo-checklist__item-desc">{step.description}</div>
              ) : null}
            </div>
            {!step.done && step.onAction ? (
              <Button size="xs" variant="light" onClick={step.onAction}>
                {step.actionLabel ?? 'Start'}
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
