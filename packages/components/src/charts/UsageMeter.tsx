import { Progress } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface UsageMeterProps {
  /** Label, e.g. "Monthly spend". */
  label: ReactNode;
  /** Percent used (0-100). */
  percent: number;
  /** Pre-formatted used value, e.g. "€42". */
  used?: ReactNode;
  /** Pre-formatted limit, e.g. "€100". */
  limit?: ReactNode;
  /** Percent at which to warn / cap. Default 90. */
  warnAt?: number;
  className?: string;
}

/**
 * UsageMeter is a horizontal usage-against-limit bar with the label and the
 * used-of-limit figures. Like BudgetCard, the bar shifts emerald to warning to
 * critical as it approaches the warn threshold, so running close to a cap is
 * visible, while the figures keep the signal honest without colour.
 */
export function UsageMeter({ label, percent, used, limit, warnAt = 90, className }: UsageMeterProps) {
  const color = percent >= warnAt ? 'red' : percent >= warnAt - 20 ? 'yellow' : 'emerald';

  return (
    <div className={clsx('upmo-usage-meter', className)}>
      <div className="upmo-usage-meter__head">
        <span className="upmo-usage-meter__label">{label}</span>
        {used != null || limit != null ? (
          <span className="upmo-usage-meter__figures">
            {used}
            {limit != null ? <span className="upmo-usage-meter__limit"> / {limit}</span> : null}
          </span>
        ) : null}
      </div>
      <Progress value={Math.min(percent, 100)} color={color} size="md" aria-label={`${label}`} />
    </div>
  );
}
