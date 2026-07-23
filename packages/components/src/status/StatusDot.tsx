import clsx from 'clsx';
import { Caret } from './Caret.tsx';
import { type Status, type Tone, statusMeta } from './status.ts';

const toneClass: Record<Tone, string> = {
  neutral: 'upmo-tone-neutral',
  active: 'upmo-tone-active',
  positive: 'upmo-tone-positive',
  attention: 'upmo-tone-attention',
  critical: 'upmo-tone-critical',
};

export interface StatusDotProps {
  /** A Phase or Attention status word. Drives the tone and the mark. */
  status: Status;
  /**
   * Accessible label. A dot is colour-only, so a label is required to keep the
   * meaning non-visual. Defaults to the status word; pass a fuller phrase for
   * context (e.g. "Invoice sync: Working").
   */
  label?: string;
  size?: number;
  className?: string;
}

/**
 * A compact status indicator for dense rows (tables, lists). Active states
 * (Working, Checking) show the small live caret; everything else is a filled
 * dot in the tone colour. Always carries an accessible label, since a dot or
 * caret alone would carry meaning by colour only.
 */
export function StatusDot({ status, label, size = 10, className }: StatusDotProps) {
  const meta = statusMeta(status);
  const accessibleLabel = label ?? status;

  if (meta.mark === 'caret-live' || meta.mark === 'caret-partial' || meta.mark === 'caret-undrawn') {
    return (
      <span className={clsx('upmo-status-dot', toneClass[meta.tone], className)} role="img" aria-label={accessibleLabel}>
        <Caret mark={meta.mark} size={size + 2} />
      </span>
    );
  }

  return (
    <span
      className={clsx('upmo-status-dot', 'upmo-status-dot--filled', toneClass[meta.tone], className)}
      role="img"
      aria-label={accessibleLabel}
      style={{ width: size, height: size }}
    />
  );
}
