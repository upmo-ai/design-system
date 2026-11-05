import { VisuallyHidden } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { IconArrowDown } from '@tabler/icons-react';
import clsx from 'clsx';
import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
  type WheelEvent,
} from 'react';

// How long the announcement stays in the status region before it is cleared.
const ANNOUNCEMENT_CLEAR_MS = 2000;

// Keys that scroll the log toward older messages.
const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

export interface ChatThreadProps {
  /** ChatMessage elements, oldest first. */
  children?: ReactNode;
  /** Accessible name of the log. Default "Messages". */
  label?: string;
  /** Shown when there are no children, e.g. a compact EmptyState. */
  empty?: ReactNode;
  /** A reply is streaming: sets aria-busy on the log. Default false. */
  busy?: boolean;
  /**
   * How new messages reach a screen reader. "manual": the log is silent and the
   * `announcement` is read, so a reply is heard once, when it has finished,
   * rather than token by token. "additions": the log announces each message as
   * it is added. Default "manual".
   */
  announce?: 'additions' | 'manual';
  /**
   * With announce="manual": the text for a polite status region, e.g. the
   * finished reply. Set it when a reply finishes. The thread reads it, then
   * clears it from the page after a moment, so a stale line is not left in the
   * reading order. A screen reader speaks only a change, so to repeat the same
   * text for a later reply, reset this to `undefined` (or "") when that reply
   * starts, and set it again when it finishes. Prefer a string: a new element
   * each render counts as a new announcement.
   */
  announcement?: ReactNode;
  /** Distance from the bottom, in px, that still counts as "at newest". Default 64. */
  followThreshold?: number;
  /**
   * When this changes (e.g. the id of the message the user just sent), the
   * thread scrolls to the newest message, even if the reader had scrolled up.
   */
  scrollKey?: string | number;
  /** Label of the jump button. Default "Jump to newest". */
  jumpLabel?: string;
  className?: string;
}

/**
 * ChatThread is the scrolling message list of a chat. It is a named
 * `log` that fills the space its parent gives it (the parent needs a height and
 * a flex or grid layout) and keeps the newest message in view: while the reader
 * is at the newest message it follows new replies and streaming growth; once
 * the reader scrolls up it stays put and offers "Jump to newest". Sending a
 * message (a change of `scrollKey`) always returns to the newest.
 *
 * Scrolling up in any way (arrow keys, Page Up, Home, the wheel, a swipe, the
 * scrollbar) lets go of the newest message at once, even by a few pixels, and
 * the thread follows again only when the reader is back within
 * `followThreshold` of the bottom.
 *
 * The log is a keyboard-scrollable region. By default it is silent and reads
 * `announcement`, so a long reply is announced when it is done and not word by
 * word; use announce="additions" to have the log announce each new message.
 * The jump scrolls smoothly unless reduced motion is on.
 */
export function ChatThread({
  children,
  label = 'Messages',
  empty,
  busy = false,
  announce = 'manual',
  announcement,
  followThreshold = 64,
  scrollKey,
  jumpLabel = 'Jump to newest',
  className,
}: ChatThreadProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [showJump, setShowJump] = useState(false);
  // Whether the thread follows the newest message. The reader unpins it by
  // scrolling up, by any amount; it is pinned again only by being back within
  // the threshold. Content that grows never unpins it.
  const pinned = useRef(true);
  // While a smooth jump is in flight its intermediate scroll events must not
  // unpin the reader again. Cleared when the bottom is reached, when the reader
  // takes over, or after a safety timeout.
  const jumping = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The scroll position and range last seen. A scroll event that lands above
  // lastTop was the reader moving up, unless the range itself shrank.
  const lastTop = useRef(0);
  const lastMax = useRef(0);
  const touchY = useRef(0);
  const threshold = useRef(followThreshold);
  threshold.current = followThreshold;

  const hasMessages = Children.toArray(children).length > 0;
  const manual = announce === 'manual';

  const releaseJump = useCallback(() => {
    jumping.current = false;
    clearTimeout(releaseTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  const remember = useCallback((el: HTMLElement) => {
    lastTop.current = el.scrollTop;
    lastMax.current = el.scrollHeight - el.clientHeight;
  }, []);

  const followNewest = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    remember(el);
  }, [remember]);

  // After a commit or a resize: follow while pinned. When the reader has let go
  // of the newest message, content that grows can put it out of reach without a
  // scroll event, so the jump button is kept in step with the distance. A smooth
  // jump in flight is left to finish.
  const settle = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || jumping.current) return;
    if (pinned.current) {
      followNewest();
    } else {
      setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > threshold.current);
    }
  }, [followNewest]);

  useLayoutEffect(() => {
    settle();
  });

  // A change of scrollKey returns to the newest message at once.
  const lastKey = useRef(scrollKey);
  useLayoutEffect(() => {
    if (Object.is(lastKey.current, scrollKey)) return;
    lastKey.current = scrollKey;
    releaseJump();
    pinned.current = true;
    setShowJump(false);
    followNewest();
  }, [scrollKey, followNewest, releaseJump]);

  // Streaming growth and late content change the list's height without a
  // commit of this component, so the list is observed. The viewport is observed
  // too: when it shrinks (the composer grows) the newest message stays in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(settle);
    observer.observe(scroller);
    if (list) observer.observe(list);
    return () => observer.disconnect();
  }, [settle]);

  // Manual announcements are spoken once and then cleared, so the same text can
  // be spoken again for a later reply and an old line does not stay in the
  // reading order.
  const [spoken, setSpoken] = useState<ReactNode>(null);
  const hasAnnouncement = announcement != null && announcement !== false && announcement !== '';
  useEffect(() => {
    if (!manual || !hasAnnouncement) {
      setSpoken(null);
      return;
    }
    setSpoken(announcement);
    const timer = setTimeout(() => setSpoken(null), ANNOUNCEMENT_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [manual, hasAnnouncement, announcement]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const top = el.scrollTop;
    const max = el.scrollHeight - el.clientHeight;
    const atNewest = max - top <= followThreshold;
    // A range that shrank clamps the position without the reader moving.
    const clamped = max < lastMax.current && top >= max - 1;
    const movedUp = top < lastTop.current && !clamped;
    lastTop.current = top;
    lastMax.current = max;
    if (jumping.current) {
      if (atNewest) {
        releaseJump();
        pinned.current = true;
        setShowJump(false);
      }
      return;
    }
    pinned.current = movedUp ? false : atNewest;
    setShowJump(!atNewest);
  }

  // The reader asked to go up. The scroll event follows a frame later, and a
  // commit can land in between, so the thread lets go now. With nothing above
  // to scroll to there is no scroll event to pin it again, so it stays pinned.
  function letGoOfNewest() {
    const el = scrollerRef.current;
    if (!el || el.scrollTop <= 0) return;
    releaseJump();
    pinned.current = false;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (UP_KEYS.has(event.key) || (event.key === ' ' && event.shiftKey)) letGoOfNewest();
    else releaseJump();
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.deltaY < 0) letGoOfNewest();
    else releaseJump();
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchY.current = event.touches[0]?.clientY ?? 0;
    releaseJump();
  }

  // A finger moving down drags older messages into view.
  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const y = event.touches[0]?.clientY ?? touchY.current;
    if (y > touchY.current) letGoOfNewest();
    touchY.current = y;
  }

  function jumpToNewest() {
    const el = scrollerRef.current;
    if (!el) return;
    pinned.current = true;
    setShowJump(false);
    if (el.scrollTo && !reduceMotion && !document.documentElement.hasAttribute('data-reduced-motion')) {
      jumping.current = true;
      clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(releaseJump, 1000);
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      followNewest();
    }
    // The button is gone after the jump, so focus would fall to the page.
    el.focus({ preventScroll: true });
  }

  return (
    <div className={clsx('upmo-chat-thread', className)}>
      <div
        ref={scrollerRef}
        className="upmo-chat-thread__scroller"
        role="log"
        tabIndex={0}
        aria-label={label}
        aria-live={manual ? 'off' : undefined}
        aria-relevant="additions"
        aria-busy={busy}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onKeyDown={handleKeyDown}
      >
        <div ref={listRef} className="upmo-chat-thread__list">
          {hasMessages ? children : empty}
        </div>
      </div>
      {showJump && hasMessages ? (
        <button type="button" className="upmo-chat-thread__jump" onClick={jumpToNewest}>
          <IconArrowDown size={14} stroke={2.2} aria-hidden="true" />
          {jumpLabel}
        </button>
      ) : null}
      {manual ? <VisuallyHidden role="status">{spoken}</VisuallyHidden> : null}
    </div>
  );
}
