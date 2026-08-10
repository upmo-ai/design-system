import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventStream, LivenessIndicator, type EventItem } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

const events: EventItem[] = [
  { id: '1', time: '08:01:02', status: 'Planning', message: 'Drafted a plan.' },
  { id: '2', time: '08:01:09', status: 'Working', message: 'Fetched 142 invoices.' },
  { id: '3', time: '08:01:20', status: 'Checking', message: 'Verifying results.', live: true },
];

// jsdom has no layout: give the list fixed scroll metrics with a writable
// scrollTop, and a scrollTo that does not move (like a smooth scroll mid-flight).
function mockScroll(el: HTMLElement, scrollTop = 0) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 200 });
  Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: scrollTop });
  const scrollTo = vi.fn();
  (el as unknown as { scrollTo: unknown }).scrollTo = scrollTo;
  return scrollTo;
}

function scrollListTo(el: HTMLElement, top: number) {
  el.scrollTop = top;
  fireEvent.scroll(el);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EventStream', () => {
  it('renders each event with its time, status and message', () => {
    renderThemed(<EventStream events={events} following />);
    expect(screen.getByText('08:01:02')).toBeInTheDocument();
    expect(screen.getByText('Fetched 142 invoices.')).toBeInTheDocument();
    // The status word appears via StatusBadge.
    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  it('shows the count and the "Following live" header when following', () => {
    renderThemed(<EventStream events={events} following />);
    expect(screen.getByText('3 events')).toBeInTheDocument();
    expect(screen.getByText('Following live')).toBeInTheDocument();
  });

  it('offers a jump-to-live control when not following, and resumes on click', () => {
    const onFollowChange = vi.fn();
    renderThemed(<EventStream events={events} following={false} onFollowChange={onFollowChange} />);
    const jump = screen.getByRole('button', { name: /jump to live/i });
    expect(jump).toBeInTheDocument();
    fireEvent.click(jump);
    expect(onFollowChange).toHaveBeenCalledWith(true);
  });

  it('renders detail lines under the message', () => {
    const withDetail: EventItem[] = [
      { id: '1', time: '08:01:02', status: 'Planning', message: 'Plan', detail: ['step one', 'step two'] },
    ];
    renderThemed(<EventStream events={withDetail} following />);
    expect(screen.getByText('step one')).toBeInTheDocument();
    expect(screen.getByText('step two')).toBeInTheDocument();
  });

  it('follows by scrolling only the list, never its ancestors', () => {
    const intoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const { rerender } = renderThemed(<EventStream events={events} following />);
    const list = screen.getByRole('log');
    mockScroll(list);
    rerender(
      <EventStream
        events={[...events, { id: '4', time: '08:01:30', status: 'Done', message: 'Finished.' }]}
        following
      />,
    );
    expect(list.scrollTop).toBe(1000);
    expect(intoView).not.toHaveBeenCalled();
  });

  it('keeps following during a smooth scroll to bottom, then pauses on a real scroll up', () => {
    const onFollowChange = vi.fn();
    renderThemed(<EventStream events={events} following onFollowChange={onFollowChange} />);
    const list = screen.getByRole('log');
    const scrollTo = mockScroll(list);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to bottom' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    onFollowChange.mockClear();
    // Mid-flight scroll events must not pause following.
    scrollListTo(list, 400);
    expect(onFollowChange).not.toHaveBeenCalled();
    // Reaching the bottom releases the guard; a later scroll up pauses.
    scrollListTo(list, 800);
    scrollListTo(list, 100);
    expect(onFollowChange).toHaveBeenCalledWith(false);
  });

  it('releases the scroll guard when the user takes over with the wheel', () => {
    const onFollowChange = vi.fn();
    renderThemed(<EventStream events={events} following onFollowChange={onFollowChange} />);
    const list = screen.getByRole('log');
    mockScroll(list);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to bottom' }));
    onFollowChange.mockClear();
    fireEvent.wheel(list);
    scrollListTo(list, 100);
    expect(onFollowChange).toHaveBeenCalledWith(false);
  });

  it('jumps instantly under reduced motion', () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      ...matchMedia(query),
      matches: query.includes('prefers-reduced-motion'),
    }));
    const onFollowChange = vi.fn();
    renderThemed(<EventStream events={events} following onFollowChange={onFollowChange} />);
    const list = screen.getByRole('log');
    const scrollTo = mockScroll(list, 800);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));
    expect(scrollTo).not.toHaveBeenCalled();
    expect(list.scrollTop).toBe(0);
    expect(onFollowChange).toHaveBeenCalledWith(false);
  });

  it('sweeps the caret only on the live row', () => {
    renderThemed(<EventStream events={events} following />);
    const list = screen.getByRole('log');
    // Working (settled) and Checking (live) both draw the live caret...
    expect(list.querySelectorAll('.upmo-caret--live')).toHaveLength(2);
    // ...but only the live row animates.
    const sweeps = list.querySelectorAll('.upmo-caret__sweep');
    expect(sweeps).toHaveLength(1);
    expect(sweeps[0].closest('.upmo-eventstream__item--live')).toBeTruthy();
  });

  it('announces new events as a polite log', () => {
    renderThemed(<EventStream events={events} following />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
    expect(log).toHaveAttribute('aria-relevant', 'additions');
  });

  it('sets the time dateTime when given', () => {
    renderThemed(
      <EventStream
        events={[{ id: '1', time: '08:01:02', dateTime: '2026-11-02T08:01:02Z', status: 'Done', message: 'Done.' }]}
        following
      />,
    );
    expect(screen.getByText('08:01:02')).toHaveAttribute('datetime', '2026-11-02T08:01:02Z');
  });

  it('shows tooltips that match the aria-labels', async () => {
    renderThemed(<EventStream events={events} following />);
    for (const name of ['Scroll to top', 'Scroll to bottom', 'Fullscreen']) {
      fireEvent.mouseEnter(screen.getByRole('button', { name }));
      expect(await screen.findByRole('tooltip', { name })).toBeInTheDocument();
    }
  });

  it('closes fullscreen on Escape and returns focus to the toggle', () => {
    const { container } = renderThemed(<EventStream events={events} following />);
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen' }));
    expect(container.querySelector('.upmo-eventstream--fullscreen')).toBeTruthy();
    screen.getByText('Fetched 142 invoices.').focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('.upmo-eventstream--fullscreen')).toBeFalsy();
    expect(screen.getByRole('button', { name: 'Fullscreen' })).toHaveFocus();
  });

  it('labels the region', () => {
    renderThemed(<EventStream events={events} label="Run activity" following />);
    expect(screen.getByRole('region', { name: 'Run activity' })).toBeInTheDocument();
  });
});

describe('LivenessIndicator', () => {
  it('shows the count and an active label when runs are live', () => {
    renderThemed(<LivenessIndicator count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    // The label is real text inside the status, so it is announced on change.
    expect(screen.getByRole('status')).toHaveTextContent('3 agents working');
  });

  it('hides the count and reads idle at zero', () => {
    renderThemed(<LivenessIndicator count={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No agents working');
  });

  it('uses the singular at one', () => {
    renderThemed(<LivenessIndicator count={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('1 agent working');
  });

  it('renders as a button and fires onClick', () => {
    const onClick = vi.fn();
    renderThemed(<LivenessIndicator count={2} onClick={onClick} />);
    const button = screen.getByRole('button', { name: '2 agents working' });
    expect(button).not.toHaveAttribute('aria-haspopup');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('announces the popover it controls', () => {
    const { rerender } = renderThemed(
      <LivenessIndicator count={2} onClick={() => {}} expanded={false} controls="running-now" />,
    );
    const button = screen.getByRole('button', { name: '2 agents working' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'running-now');
    rerender(<LivenessIndicator count={2} onClick={() => {}} expanded controls="running-now" />);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<LivenessIndicator count={2} />, theme);
      unmount();
    }
  });
});
