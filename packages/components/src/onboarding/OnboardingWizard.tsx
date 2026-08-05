import { Button, Group } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface OnboardingStep {
  title: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
}

export interface OnboardingWizardProps {
  steps: OnboardingStep[];
  /** The active step index (controlled). */
  active: number;
  onActiveChange: (index: number) => void;
  /** Called on the last step's primary action. */
  onFinish?: () => void;
  /** Skip handler; shows a Skip button when set. */
  onSkip?: () => void;
  finishLabel?: string;
  className?: string;
}

/**
 * OnboardingWizard is a focused, linear first-run flow: one step at a time with
 * a dot progress indicator, Back and Next, a Skip escape hatch, and a Finish on
 * the last step. It is deliberately simple, carrying a single idea per step, and
 * never traps the user (Skip is always available when provided).
 */
export function OnboardingWizard({
  steps,
  active,
  onActiveChange,
  onFinish,
  onSkip,
  finishLabel = 'Finish',
  className,
}: OnboardingWizardProps) {
  const step = steps[active];
  const isFirst = active === 0;
  const isLast = active === steps.length - 1;

  return (
    <div className={clsx('upmo-onboarding', className)}>
      <div className="upmo-onboarding__dots" aria-hidden="true">
        {steps.map((_, i) => (
          <span
            key={i}
            className={clsx('upmo-onboarding__dot', i === active && 'upmo-onboarding__dot--active')}
          />
        ))}
      </div>

      <div key={active} className="upmo-onboarding__step upmo-step-enter">
        <h3 className="upmo-onboarding__title">{step.title}</h3>
        {step.description ? <p className="upmo-onboarding__desc">{step.description}</p> : null}
        {step.content ? <div className="upmo-onboarding__content">{step.content}</div> : null}
      </div>

      <Group justify="space-between" mt="lg">
        <div>
          {onSkip ? (
            <Button variant="subtle" color="gray" onClick={onSkip}>
              Skip
            </Button>
          ) : null}
        </div>
        <Group gap="xs">
          {!isFirst ? (
            <Button variant="default" onClick={() => onActiveChange(active - 1)}>
              Back
            </Button>
          ) : null}
          {isLast ? (
            <Button onClick={onFinish}>{finishLabel}</Button>
          ) : (
            <Button onClick={() => onActiveChange(active + 1)}>Next</Button>
          )}
        </Group>
      </Group>
    </div>
  );
}
