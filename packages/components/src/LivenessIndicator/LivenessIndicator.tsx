import clsx from 'clsx';
import { Caret } from '../status/Caret.tsx';

export interface LivenessIndicatorProps {
  /**
   * How many runs are active right now. Drives the caret state and the count:
   * 0 shows a calm, idle caret and no number; >0 shows the live sweeping caret
   * and the count. This is the ambient, always-present liveness mark for the
   * app shell (distinct from the notifications bell, which counts attention
   * items, not active work).
   */
  count: number;
  /**
   * Accessible label. Defaults to a sensible phrasing from the count
   * ("3 agents working" / "No agents working"); pass a fuller phrase for
   * context.
   */
  label?: string;
  /** Called when the indicator is activated (e.g. to open the activity view). */
  onClick?: () => void;
  size?: number;
  className?: string;
}

/**
 * The global liveness indicator: an ambient caret that sweeps while any run is
 * active, with the count of active runs beside it. It is the shell's quiet "the
 * workforce is working" signal, the philosophy's "alive, not noisy" made
 * concrete: one caret, one number, no chrome. At zero it rests as a calm, fully
 * drawn caret with no count. Under reduced motion the caret stops sweeping; the
 * count and the drawn caret still carry the state.
 *
 * Renders as a button when onClick is given (a target to open the activity
 * view), otherwise as a plain status element with role="status".
 */
export function LivenessIndicator({
  count,
  label,
  onClick,
  size = 16,
  className,
}: LivenessIndicatorProps) {
  const live = count > 0;
  const accessibleLabel =
    label ?? (live ? `${count} ${count === 1 ? 'agent' : 'agents'} working` : 'No agents working');

  const inner = (
    <>
      <Caret mark={live ? 'caret-live' : 'caret-undrawn'} size={size} />
      {live ? <span className="upmo-liveness__count">{count}</span> : null}
    </>
  );

  const classes = clsx(
    'upmo-liveness',
    live ? 'upmo-tone-active' : 'upmo-tone-neutral',
    live && 'upmo-liveness--live',
    className,
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-label={accessibleLabel}>
        {inner}
      </button>
    );
  }

  return (
    <span className={classes} role="status" aria-label={accessibleLabel}>
      {inner}
    </span>
  );
}
