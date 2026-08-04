import { Text } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface StatTileProps {
  /** The metric label, e.g. "Runs today". */
  label: ReactNode;
  /** The headline value, pre-formatted, e.g. "1,284" or "€42.10". */
  value: ReactNode;
  /** A small supporting line under the value. */
  hint?: ReactNode;
  /** An optional trend chip (e.g. "+12%"). */
  trend?: {
    direction: TrendDirection;
    label: ReactNode;
    /** Whether "up" is good (green) or bad (red). Default good. */
    goodWhenUp?: boolean;
  };
  className?: string;
}

/**
 * StatTile is a single metric tile for a usage or overview dashboard: a label,
 * a large tabular-numeral value, an optional hint, and an optional trend chip.
 * The trend tone follows meaning, not direction: by default up is positive and
 * down is critical, but goodWhenUp=false flips it (e.g. for cost or error rate).
 */
export function StatTile({ label, value, hint, trend, className }: StatTileProps) {
  const goodWhenUp = trend?.goodWhenUp ?? true;
  const tone =
    !trend || trend.direction === 'flat'
      ? 'neutral'
      : (trend.direction === 'up') === goodWhenUp
        ? 'positive'
        : 'critical';
  const TrendIcon = trend?.direction === 'down' ? IconArrowDownRight : IconArrowUpRight;

  return (
    <div className={clsx('upmo-stat-tile', className)}>
      <Text className="upmo-stat-tile__label">{label}</Text>
      <div className="upmo-stat-tile__value">{value}</div>
      <div className="upmo-stat-tile__footer">
        {trend ? (
          <span className={clsx('upmo-stat-tile__trend', `upmo-tone-${tone}`)}>
            {trend.direction !== 'flat' ? <TrendIcon size={13} stroke={2.2} aria-hidden="true" /> : null}
            {trend.label}
          </span>
        ) : null}
        {hint ? <span className="upmo-stat-tile__hint">{hint}</span> : null}
      </div>
    </div>
  );
}
