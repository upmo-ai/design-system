import { Stepper } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface ConnectWizardStep {
  label: string;
  description?: string;
  content: ReactNode;
}

export interface ConnectWizardProps {
  steps: ConnectWizardStep[];
  /** The active step index (controlled). */
  active: number;
  /**
   * Called when the user picks a step. The wizard only allows going back (you
   * cannot skip ahead past unvalidated steps); forward is driven by the
   * consumer's own Next buttons inside each step's content.
   */
  onStepChange: (index: number) => void;
  className?: string;
}

/**
 * ConnectWizard is the shell for a multi-step connect flow (pick a service,
 * enter credentials, set scope, test the connection). It is a Stepper that only
 * allows stepping backward; forward movement is gated by the consumer's own
 * per-step Next buttons, so a step cannot be skipped before it validates. The
 * final step typically holds a TestConnectionPanel whose success gates Connect.
 */
export function ConnectWizard({ steps, active, onStepChange, className }: ConnectWizardProps) {
  return (
    <Stepper
      active={active}
      onStepClick={onStepChange}
      allowNextStepsSelect={false}
      completedIcon={<IconCheck size={16} />}
      className={clsx('upmo-connect-wizard', className)}
    >
      {steps.map((step) => (
        <Stepper.Step key={step.label} label={step.label} description={step.description}>
          <div className="upmo-connect-wizard__content">{step.content}</div>
        </Stepper.Step>
      ))}
    </Stepper>
  );
}
