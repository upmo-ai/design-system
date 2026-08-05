import { ActionIcon, Progress, Tooltip } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import clsx from 'clsx';

export interface BudgetCardProps {
  /** Percent of the budget used (0-100). Drives the bar and the label. */
  percent: number;
  /** Pre-formatted cost so far, e.g. "€2.10". */
  cost: string;
  /** Pre-formatted spend limit, e.g. "€5.00". */
  limit: string;
  /** Raw token count; shown as "38k". */
  tokens?: number;
  /** The percent at which the run auto-pauses, e.g. 90. */
  pauseAt?: number;
  /** Edit handler; shows the pencil when set. */
  onEdit?: () => void;
  /** Link to the usage detail for this task. */
  usageHref?: string;
  className?: string;
}

function tone(percent: number, pauseAt?: number): 'ok' | 'near' | 'over' {
  const threshold = pauseAt ?? 90;
  if (percent >= threshold) return 'over';
  if (percent >= threshold - 20) return 'near';
  return 'ok';
}

/**
 * BudgetCard shows how much of a task's spend budget is used: a progress bar, a
 * percent, and a meta line of cost-of-limit, tokens, and the pause threshold.
 * Unlike the product's flat bar, the bar changes colour as it nears the pause
 * threshold (emerald -> warning -> critical), so overspend risk is visible, not
 * only stated in text. The meta still names the threshold, so the signal is
 * never colour alone.
 */
export function BudgetCard({
  percent,
  cost,
  limit,
  tokens,
  pauseAt = 90,
  onEdit,
  usageHref,
  className,
}: BudgetCardProps) {
  const state = tone(percent, pauseAt);
  const color = state === 'over' ? 'red' : state === 'near' ? 'yellow' : 'emerald';
  const tokenLabel = tokens != null ? `${Math.round(tokens / 1000)}k tokens` : null;

  return (
    <div className={clsx('upmo-budget', className)}>
      <div className="upmo-budget__head">
        <h4 className="upmo-budget__title">Budget</h4>
        {onEdit ? (
          <Tooltip label="Edit" position="bottom" openDelay={400} withinPortal>
            <ActionIcon
              variant="subtle"
              aria-label="Edit budget"
              className="upmo-icon-button"
              onClick={onEdit}
            >
              <IconPencil size={15} stroke={1.75} />
            </ActionIcon>
          </Tooltip>
        ) : null}
      </div>

      <div className="upmo-budget__progress">
        <Progress
          value={Math.min(percent, 100)}
          color={color}
          size="sm"
          aria-label="Budget used"
          className="upmo-budget__bar"
        />
        <span className="upmo-budget__pct">{percent}%</span>
      </div>

      <div className="upmo-budget__meta">
        {[`${cost} of ${limit}`, tokenLabel, `pauses at ${pauseAt}%`].filter(Boolean).join(' · ')}
      </div>

      {usageHref ? (
        <a className="upmo-budget__link" href={usageHref}>
          See usage for this task
        </a>
      ) : null}
    </div>
  );
}
