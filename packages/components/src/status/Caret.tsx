import clsx from 'clsx';
import type { Mark } from './status.ts';

export interface CaretProps {
  /** Which caret state to draw. Only 'caret-*' marks render a caret. */
  mark: Extract<Mark, 'caret-live' | 'caret-partial' | 'caret-undrawn'>;
  /** Pixel size of the caret box. */
  size?: number;
  className?: string;
}

/**
 * The Upmo caret: the brand mark and the signature of liveness. It is an upward
 * chevron drawn in two strokes. State determines how much is drawn:
 * - undrawn: both strokes faint (Preparing)
 * - partial: left stroke drawn, right faint (Planning)
 * - live: both strokes drawn, the up-stroke sweeps on a loop (Working, Checking)
 *
 * The live sweep uses the duration-sweep / ease-caret tokens. Under reduced
 * motion it collapses to a static, fully drawn caret (see styles.css), so the
 * meaning never depends on motion.
 */
export function Caret({ mark, size = 14, className }: CaretProps) {
  const live = mark === 'caret-live';
  const leftDrawn = mark !== 'caret-undrawn';
  const rightDrawn = mark === 'caret-live';

  return (
    <svg
      className={clsx('upmo-caret', live && 'upmo-caret--live', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path className={clsx('upmo-caret__stroke', !leftDrawn && 'upmo-caret__stroke--idle')} d="M4 15L12 7" />
      <path
        className={clsx('upmo-caret__stroke', live && 'upmo-caret__sweep', !rightDrawn && 'upmo-caret__stroke--idle')}
        d="M12 7l8 8"
      />
    </svg>
  );
}
