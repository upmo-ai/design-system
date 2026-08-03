import clsx from 'clsx';
import type { Phase } from '../status/status.ts';
import { phases as allPhases } from '../status/status.ts';

export interface PhaseRailProps {
  /**
   * The phases to show, in order. Defaults to the four lifecycle phases
   * (Preparing, Planning, Working, Checking). Done and Failed are task
   * outcomes, not rail nodes.
   */
  phases?: Phase[];
  /** The current phase (the node that gets the emerald ring). Null when finished. */
  current: Phase | null;
  /**
   * Whether the task has finished. When true, every node reads as done (the
   * whole rail is emerald) and there is no current ring.
   */
  done?: boolean;
  /** Whether the task failed. The current node reads critical rather than active. */
  failed?: boolean;
  className?: string;
}

/**
 * PhaseRail is the task's vertical phase timeline: a node-rail where completed
 * phases fill emerald (node + the rail segment below), the current phase shows
 * an emerald ring, and future phases are a quiet outline. It is the narrative
 * per-task view that complements the flat EventStream.
 */
export function PhaseRail({
  phases = [...allPhases].filter((p) => p !== 'Done' && p !== 'Failed') as Phase[],
  current,
  done,
  failed,
  className,
}: PhaseRailProps) {
  const currentIndex = current ? phases.indexOf(current) : -1;

  return (
    <ol className={clsx('upmo-phaserail', className)} aria-label="Phases">
      {phases.map((phase, i) => {
        const isDone = done || (currentIndex >= 0 && i < currentIndex);
        const isCurrent = !done && phase === current;
        return (
          <li
            key={phase}
            className={clsx(
              'upmo-phaserail__item',
              isCurrent && 'upmo-phaserail__item--current',
              isCurrent && failed && 'upmo-phaserail__item--failed',
            )}
            data-done={isDone ? 'true' : undefined}
            data-current={isCurrent ? 'true' : undefined}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {phase}
          </li>
        );
      })}
    </ol>
  );
}
