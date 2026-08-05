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
import { StatusBadge } from '../status/StatusBadge.tsx';
import { StatusDot } from '../status/StatusDot.tsx';
import type { Status } from '../status/status.ts';

export interface EventItem {
  /** Stable key for the row. */
  id: string;
  /** Pre-formatted clock string, e.g. "08:01:02". Rendered in a monospace <time>. */
  time: string;
  /**
   * The status this event belongs to (a Phase or an Attention word). Drives the
   * tone and the mark: active phases (Working, Checking) carry the live caret,
   * so a running event reads as alive. Matches the Upmo status model.
   */
  status: Status;
  /** One-line human description of the event. */
  message: ReactNode;
  /** Optional extra lines rendered, indented, under the message. */
  detail?: ReactNode[];
  /**
   * Mark this event as the live, in-progress one. The row gets the live accent
   * and, when following, is the scroll target. Usually the last item.
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
 * down. Under reduced motion the caret stops sweeping but the stream still
 * follows; liveness never depends on motion alone.
 */
export function EventStream({
  events,
  following = true,
  onFollowChange,
  maxHeight = 360,
  label = 'Activity',
  className,
}: EventStreamProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  // Guard against the follow-driven scroll re-triggering the scroll handler.
  const programmaticScroll = useRef(false);

  // Follow the live edge: scroll to the newest event when following and the set
  // of events changes.
  useEffect(() => {
    if (!following) return;
    const end = endRef.current;
    if (!end) return;
    // scrollIntoView is absent in some environments (jsdom); guard it so the
    // component mounts and follows wherever the DOM is partial.
    if (typeof end.scrollIntoView !== 'function') return;
    programmaticScroll.current = true;
    end.scrollIntoView({ block: 'end' });
    // Release the guard on the next frame, after the scroll event has fired.
    const id = requestAnimationFrame(() => {
      programmaticScroll.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [events, following]);

  // Close fullscreen on Escape.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // Scrolling up pauses following; scrolling back to the bottom resumes it.
  function handleScroll() {
    if (programmaticScroll.current) return;
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (atBottom && !following) onFollowChange?.(true);
    else if (!atBottom && following) onFollowChange?.(false);
  }

  function scrollTop() {
    const el = listRef.current;
    if (el?.scrollTo) el.scrollTo({ top: 0, behavior: 'smooth' });
    else if (el) el.scrollTop = 0;
    onFollowChange?.(false);
  }

  function scrollBottom() {
    const el = listRef.current;
    if (el?.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    else if (el) el.scrollTop = el.scrollHeight;
    onFollowChange?.(true);
  }

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
            <span className="upmo-eventstream__follow" aria-live="off">
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
            <Tooltip label="Top" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Scroll to top"
                className="upmo-icon-button"
                onClick={scrollTop}
              >
                <IconArrowBarToUp size={15} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Bottom" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Scroll to bottom"
                className="upmo-icon-button"
                onClick={scrollBottom}
              >
                <IconArrowBarToDown size={15} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label={fullscreen ? 'Exit' : 'Expand'}
              position="bottom"
              openDelay={400}
              withinPortal
            >
              <ActionIcon
                variant="subtle"
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className="upmo-icon-button"
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? <IconMinimize size={15} stroke={1.75} /> : <IconMaximize size={15} stroke={1.75} />}
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
      </div>

      <ol
        ref={listRef}
        className="upmo-eventstream__list"
        style={{ maxHeight: fullscreen ? undefined : maxHeight }}
        onScroll={handleScroll}
      >
        {events.map((ev) => (
          <li
            key={ev.id}
            className={clsx('upmo-eventstream__item', ev.live && 'upmo-eventstream__item--live')}
          >
            <div className="upmo-eventstream__row">
              <time className="upmo-eventstream__time">{ev.time}</time>
              <StatusBadge status={ev.status} className="upmo-eventstream__phase" />
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
        <li ref={endRef} className="upmo-eventstream__end" aria-hidden="true" />
      </ol>
    </section>
  );
}
