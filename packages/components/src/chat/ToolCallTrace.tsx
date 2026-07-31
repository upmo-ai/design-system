import { useState } from 'react';
import { IconChevronRight, IconTool } from '@tabler/icons-react';
import clsx from 'clsx';
import { Spinner } from '../Spinner/Spinner.tsx';
import { StatusDot } from '../status/StatusDot.tsx';
import { JsonBlock } from '../CodeBlock/JsonBlock.tsx';
import type { Tone } from '../status/status.ts';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

const statusTone: Record<ToolCallStatus, Tone> = {
  pending: 'neutral',
  running: 'active',
  success: 'positive',
  error: 'critical',
};

const statusWord: Record<ToolCallStatus, string> = {
  pending: 'Queued',
  running: 'Running',
  success: 'Done',
  error: 'Failed',
};

export interface ToolCallTraceProps {
  /** The tool/function name, e.g. "send_invoice". */
  name: string;
  /** The call status. Drives the tone and the mark. */
  status: ToolCallStatus;
  /** The arguments passed to the tool. Rendered as pretty JSON when expanded. */
  args?: unknown;
  /** The result payload. Rendered as pretty JSON when expanded and successful. */
  result?: unknown;
  /** The error message, shown when status is "error". */
  error?: string;
  /** Pre-formatted duration, e.g. "0.4 s". */
  duration?: string;
  /** Start expanded. Default false (collapsed to the one-line summary). */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * A tool-call trace: the agent calling a tool, shown inline in a chat or event
 * stream. Collapsed, it is a one-line summary (a tool glyph, the name, a status
 * mark and word, and the duration). Expanded, it reveals the arguments and the
 * result (or error) as pretty JSON. Running calls show the spinner (a tool call
 * is a discrete wait, not agent liveness, so it uses the spinner, not the
 * caret); terminal calls use the status dot.
 */
export function ToolCallTrace({
  name,
  status,
  args,
  result,
  error,
  duration,
  defaultOpen = false,
  className,
}: ToolCallTraceProps) {
  const [open, setOpen] = useState(defaultOpen);
  const tone = statusTone[status];

  return (
    <div className={clsx('upmo-toolcall', className)} data-status={status}>
      <button
        type="button"
        className="upmo-toolcall__summary"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <IconChevronRight
          size={14}
          className={clsx('upmo-toolcall__chevron', open && 'upmo-toolcall__chevron--open')}
          aria-hidden="true"
        />
        <IconTool size={15} stroke={1.75} className="upmo-toolcall__glyph" aria-hidden="true" />
        <code className="upmo-toolcall__name">{name}</code>
        <span className="upmo-toolcall__status">
          {status === 'running' ? (
            <Spinner size={14} label="Running" />
          ) : (
            <StatusDot status={status === 'success' ? 'Done' : status === 'error' ? 'Failed' : 'Queued'} label={statusWord[status]} />
          )}
          <span className={clsx('upmo-toolcall__word', `upmo-tone-${tone}`)}>{statusWord[status]}</span>
        </span>
        {duration ? <span className="upmo-toolcall__duration">{duration}</span> : null}
      </button>

      {open ? (
        <div className="upmo-toolcall__body">
          {args !== undefined ? (
            <div className="upmo-toolcall__section">
              <div className="upmo-toolcall__label">Arguments</div>
              <JsonBlock value={args} />
            </div>
          ) : null}
          {status === 'error' && error ? (
            <div className="upmo-toolcall__section">
              <div className="upmo-toolcall__label">Error</div>
              <div className="upmo-toolcall__error">{error}</div>
            </div>
          ) : null}
          {status === 'success' && result !== undefined ? (
            <div className="upmo-toolcall__section">
              <div className="upmo-toolcall__label">Result</div>
              <JsonBlock value={result} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
