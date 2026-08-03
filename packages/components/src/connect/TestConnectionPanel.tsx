import { Button } from '@mantine/core';
import {
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { Spinner } from '../Spinner/Spinner.tsx';
import type { Tone } from '../status/status.ts';

export type TestConnectionState = 'idle' | 'testing' | 'success' | 'error';

export interface TestConnectionPanelProps {
  /** The current test state. */
  state: TestConnectionState;
  /** Run the test. Disabled while testing. */
  onTest: () => void;
  /** Measured latency (ms), shown on success. */
  latencyMs?: number;
  /** Error message, shown on error. */
  error?: string;
  /** Test button label. Default "Test connection". */
  testLabel?: string;
  className?: string;
}

const meta: Record<
  TestConnectionState,
  { tone: Tone; title: string; icon: 'info' | 'check' | 'error' | 'spin' }
> = {
  idle: { tone: 'neutral', title: 'Ready to test', icon: 'info' },
  testing: { tone: 'active', title: 'Testing connection', icon: 'spin' },
  success: { tone: 'positive', title: 'Connection verified', icon: 'check' },
  error: { tone: 'critical', title: 'Connection failed', icon: 'error' },
};

/**
 * TestConnectionPanel is the verification step of a connect flow: a Test button
 * and a toned status panel that moves through idle, testing, success and error.
 * Success shows the latency; error shows the message. The consumer gates the
 * final "Connect" on `state === "success"`, so a connection cannot be saved
 * without a passing test.
 */
export function TestConnectionPanel({
  state,
  onTest,
  latencyMs,
  error,
  testLabel = 'Test connection',
  className,
}: TestConnectionPanelProps) {
  const m = meta[state];

  const icon =
    m.icon === 'spin' ? (
      <Spinner size={16} label="Testing" />
    ) : m.icon === 'check' ? (
      <IconCircleCheck size={16} aria-hidden="true" />
    ) : m.icon === 'error' ? (
      <IconExclamationCircle size={16} aria-hidden="true" />
    ) : (
      <IconInfoCircle size={16} aria-hidden="true" />
    );

  return (
    <div className={clsx('upmo-testconn', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onTest}
        loading={state === 'testing'}
        disabled={state === 'testing'}
      >
        {testLabel}
      </Button>

      <div className={clsx('upmo-testconn__status', `upmo-tone-${m.tone}`)} role="status">
        <span className="upmo-testconn__icon">{icon}</span>
        <div className="upmo-testconn__text">
          <span className="upmo-testconn__title">{m.title}</span>
          {state === 'success' && latencyMs != null ? (
            <span className="upmo-testconn__detail">Responded in {latencyMs} ms.</span>
          ) : null}
          {state === 'error' && error ? (
            <span className="upmo-testconn__detail">{error}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
