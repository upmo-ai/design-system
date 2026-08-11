import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  IconArrowBarToDown,
  IconArrowBarToUp,
  IconArrowDown,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { StatusBadge } from '../status/StatusBadge.tsx';
import { StatusDot } from '../status/StatusDot.tsx';
import type { Status } from '../status/status.ts';

export interface EventItem {
  /** Stable key for the row. */
  id: string;
  /** Pre-formatted clock string, e.g. "08:01:02". Rendered in a monospace <time>. */
  time: string;
  /** Optional machine-readable timestamp (ISO 8601) for the <time> dateTime. */
  dateTime?: string;
  /**
   * The status this event belongs to (a Phase or an Attention word). Drives the
   * tone and the mark: active phases (Working, Checking) carry the caret, which
   * sweeps only on the live row, so settled history stays still. Matches the
   * Upmo status model.
   */
  status: Status;
  /** One-line human description of the event. */
  message: ReactNode;
  /** Optional extra lines rendered, indented, under the message. */
  detail?: ReactNode[];
  /**
   * Mark this event as the live, in-progress one. The row gets the live accent
   * and its caret sweeps. Usually the last item.
   */
  live?: boolean;
}

export interface EventStreamProps {
  /** The events, oldest first. The newest (last) is the live edge. */
  events: EventItem[];
  /**
   * Follow the live edge: when true, the stream auto-scrolls to the newest event
   * as events arrive, and the header reads "Following live". Controlled; pair
   * with onFollowChange for the pause/resume affordance. Default true.
   */
  following?: boolean;
  /** Called when the user pauses (scrolls up) or resumes following. */
  onFollowChange?: (following: boolean) => void;
  /** Max height before the list scrolls. Default 360. */
  maxHeight?: number | string;
  /** Accessible label for the stream region. Default "Activity". */
  label?: string;
  className?: string;
}

/**
 * EventStream is the "alive" surface: a flat, timestamped activity log of what
 * the agent is doing. Each row is a monospace time, a StatusBadge for the
 * phase/attention (the live caret sweeps for in-flight events), and the message,
 * with optional indented detail lines.
 *
 * Unlike a static log, it follows the live edge: new events auto-scroll into
 * view while `following` is true, and scrolling up pauses following (surfacing a
 * "jump to live" control) so the user can read history without being yanked
 * down. Only the list scrolls; the page around it never moves. The list is a
 * polite live log, so screen readers hear new events as they arrive. Under
 * reduced motion the caret stops sweeping and the scroll controls jump instead
 * of gliding; liveness never depends on motion alone.
 */
export function EventStream({
  events,
  following = true,
  onFollowChange,
  maxHeight = 360,
  label = 'Activity',
  className,
}: EventStreamProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLButtonElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const reduceMotion = useReducedMotion();
  // While a smooth button scroll is in flight, its intermediate scroll events
  // must not flip following. Holds the target edge until it is reached, the
  // user takes over (wheel/touch), or a safety timeout passes.
  const scrollTarget = useRef<'top' | 'bottom' | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function releaseScrollGuard() {
    scrollTarget.current = null;
    clearTimeout(releaseTimer.current);
  }

  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  // Follow the live edge: when following and the set of events changes, scroll
  // the list (only the list, never its ancestors) to the newest event. The jump
  // lands at the bottom, so its scroll event leaves following on.
  useEffect(() => {
    if (!following) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events, following]);

  // Close fullscreen on Escape, returning focus to the fullscreen toggle.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setFullscreen(false);
      fullscreenRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // Scrolling up pauses following; scrolling back to the bottom resumes it.
  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (scrollTarget.current) {
      const reached = scrollTarget.current === 'top' ? el.scrollTop <= 0 : atBottom;
      if (reached) releaseScrollGuard();
      return;
    }
    if (atBottom && !following) onFollowChange?.(true);
    else if (!atBottom && following) onFollowChange?.(false);
  }

  function scrollToEdge(edge: 'top' | 'bottom') {
    const el = listRef.current;
    if (!el) return;
    const top = edge === 'top' ? 0 : el.scrollHeight;
    if (el.scrollTo && !reduceMotion) {
      scrollTarget.current = edge;
      clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(releaseScrollGuard, 1000);
      el.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollTop = top;
    }
    onFollowChange?.(edge === 'bottom');
  }

  const fullscreenLabel = fullscreen ? 'Exit fullscreen' : 'Fullscreen';

  const liveCount = events.filter((e) => e.live).length;

  return (
    <section
      className={clsx('upmo-eventstream', fullscreen && 'upmo-eventstream--fullscreen', className)}
      aria-label={label}
    >
      <div className="upmo-eventstream__head">
        <span className="upmo-eventstream__count">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        <div className="upmo-eventstream__head-right">
          {following ? (
            <span className="upmo-eventstream__follow">
              {liveCount > 0 ? <StatusDot status="Working" label="Live" /> : null}
              Following live
            </span>
          ) : (
            <button
              type="button"
              className="upmo-eventstream__jump"
              onClick={() => onFollowChange?.(true)}
            >
              <IconArrowDown size={13} stroke={2.2} aria-hidden="true" />
              Jump to live
            </button>
          )}
          <div className="upmo-eventstream__actions">
            <Tooltip label="Scroll to top" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Scroll to top"
                className="upmo-icon-button"
                onClick={() => scrollToEdge('top')}
              >
                <IconArrowBarToUp size={15} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Scroll to bottom" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Scroll to bottom"
                className="upmo-icon-button"
                onClick={() => scrollToEdge('bottom')}
              >
                <IconArrowBarToDown size={15} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={fullscreenLabel} position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                ref={fullscreenRef}
                variant="subtle"
                aria-label={fullscreenLabel}
                className="upmo-icon-button"
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? <IconMinimize size={15} stroke={1.75} /> : <IconMaximize size={15} stroke={1.75} />}
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* The scroll container is the live log; the list inside keeps its list
          semantics (a role on the <ol> itself would replace them). */}
      <div
        ref={listRef}
        className="upmo-eventstream__list"
        style={{ maxHeight: fullscreen ? undefined : maxHeight }}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={handleScroll}
        onWheel={releaseScrollGuard}
        onTouchStart={releaseScrollGuard}
      >
        <ol className="upmo-eventstream__items">
          {events.map((ev) => (
            <li
              key={ev.id}
              className={clsx('upmo-eventstream__item', ev.live && 'upmo-eventstream__item--live')}
            >
              <div className="upmo-eventstream__row">
                <time className="upmo-eventstream__time" dateTime={ev.dateTime}>
                  {ev.time}
                </time>
                <StatusBadge status={ev.status} live={ev.live === true} className="upmo-eventstream__phase" />
                <span className="upmo-eventstream__msg">{ev.message}</span>
              </div>
              {ev.detail && ev.detail.length > 0 ? (
                <div className="upmo-eventstream__detail">
                  {ev.detail.map((d, i) => (
                    <div key={i}>{d}</div>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
