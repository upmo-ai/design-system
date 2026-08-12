import { Group, Stack, Text, Title } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Button } from '../Button/Button.tsx';
import { Icon } from '../icon/Icon.tsx';
import { StatusBadge } from '../status/StatusBadge.tsx';
import { Caret } from '../status/Caret.tsx';
import { statusMeta, type Status } from '../status/status.ts';

export interface TaskHeaderMeta {
  runNumber?: number;
  engine?: string;
  model?: string;
  startedAt?: string;
  /** Pre-formatted running cost, e.g. "€2.10". Highlighted in the meta row. */
  cost?: string;
}

export interface TaskHeaderProps {
  /** The task title (the page h1). */
  title: ReactNode;
  /** The task status (a Phase or Attention word). Drives the badge and the caret. */
  status: Status;
  /** The meta row (run, engine, model, start, cost). */
  meta?: TaskHeaderMeta;
  /** A one-line task description under the meta. */
  detail?: ReactNode;
  /** Whether the task is paused; toggles the Pause/Resume label. */
  paused?: boolean;
  onTogglePause?: () => void;
  /** Enable the primary "Next phase" action. */
  canAdvance?: boolean;
  onNextPhase?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * TaskHeader frames a task page: the title with its StatusBadge, a dot-separated
 * meta row (run, engine, model, start, highlighted cost, and a caret status
 * indicator echoing the live state), an optional description, and the task
 * actions (Pause/Resume, the primary Next phase, Share). It assembles the
 * status surface and controls into the one header every task page uses.
 */
export function TaskHeader({
  title,
  status,
  meta,
  detail,
  paused,
  onTogglePause,
  canAdvance,
  onNextPhase,
  onShare,
  className,
}: TaskHeaderProps) {
  const metaBits = [
    meta?.runNumber != null ? `Run ${meta.runNumber}` : null,
    meta?.engine,
    meta?.model,
    meta?.startedAt ? `started ${meta.startedAt}` : null,
  ].filter(Boolean);

  const { mark } = statusMeta(status);
  const caretMark =
    mark === 'caret-live' || mark === 'caret-partial' || mark === 'caret-undrawn'
      ? mark
      : 'caret-undrawn';

  return (
    <header className={clsx('upmo-task-header', className)}>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Group gap="sm" align="center" wrap="wrap">
            <Title order={1}>{title}</Title>
            <StatusBadge status={status} />
          </Group>

          <div className="upmo-task-header__meta">
            {metaBits.join(' · ')}
            {meta?.cost ? (
              <>
                {metaBits.length ? ' · ' : null}
                <span className="upmo-task-header__cost">{meta.cost}</span>
              </>
            ) : null}
            <span className="upmo-task-header__indicator">
              <Caret mark={caretMark} size={12} className={clsx(mark === 'caret-live' && 'upmo-tone-active')} />
              {status}
            </span>
          </div>

          {detail ? (
            <Text size="sm" c="dimmed">
              {detail}
            </Text>
          ) : null}
        </Stack>

        <Group gap="sm" wrap="wrap">
          {onTogglePause ? (
            <Button
              type="button"
              variant="default"
              onClick={onTogglePause}
              leftSection={<Icon concept={paused ? 'action.resume' : 'action.pause'} size={16} />}
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
          ) : null}
          {onNextPhase ? (
            <Button
              type="button"
              onClick={onNextPhase}
              disabled={!canAdvance}
              rightSection={<Icon concept="action.next" size={16} />}
            >
              Next phase
            </Button>
          ) : null}
          {onShare ? (
            <Button
              type="button"
              variant="default"
              onClick={onShare}
              leftSection={<Icon concept="action.share" size={16} />}
            >
              Share
            </Button>
          ) : null}
        </Group>
      </Group>
    </header>
  );
}
