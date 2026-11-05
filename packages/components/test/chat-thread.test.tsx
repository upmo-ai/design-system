import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatMessage, ChatThread, EmptyState } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

// jsdom has no layout: give the log fixed scroll metrics with a writable
// scrollTop, and a scrollTo that does not move (like a smooth scroll mid-flight).
function mockScroll(el: HTMLElement, { scrollTop = 800, scrollHeight = 1000 } = {}) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, writable: true, value: scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 200 });
  Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: scrollTop });
  const scrollTo = vi.fn();
  (el as unknown as { scrollTo: unknown }).scrollTo = scrollTo;
  return scrollTo;
}

function scrollLogTo(el: HTMLElement, top: number) {
  el.scrollTop = top;
  fireEvent.scroll(el);
}

// The content grew (or shrank) without the reader moving.
function setHeight(el: HTMLElement, scrollHeight: number) {
  (el as unknown as { scrollHeight: number }).scrollHeight = scrollHeight;
}

const messages = (n: number) =>
  Array.from({ length: n }, (_, i) => <ChatMessage key={i} role="user" content={`Message ${i + 1}`} />);

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-reduced-motion');
});

describe('ChatThread', () => {
  it('is a log named Messages, busy while a reply streams', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log', { name: 'Messages' });
    expect(log).toHaveAttribute('aria-busy', 'false');
    expect(log).toHaveAttribute('aria-relevant', 'additions');
    expect(log).toHaveAttribute('tabindex', '0');
    rerender(
      <ChatThread busy label="Chat">
        {messages(2)}
      </ChatThread>,
    );
    expect(screen.getByRole('log', { name: 'Chat' })).toHaveAttribute('aria-busy', 'true');
  });

  it('follows new replies while the reader is at the newest message', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 780);
    rerender(<ChatThread>{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(1000);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
  });

  it('keeps following when a streaming reply grows the list', () => {
    let notify: () => void = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    (log as unknown as { scrollHeight: number }).scrollHeight = 1500;
    notify();
    expect(log.scrollTop).toBe(1500);

    scrollLogTo(log, 100);
    (log as unknown as { scrollHeight: number }).scrollHeight = 2000;
    notify();
    expect(log.scrollTop).toBe(100);
  });

  it('stays put and offers Jump to newest when the reader has scrolled up', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    expect(screen.getByRole('button', { name: 'Jump to newest' })).toBeInTheDocument();
    rerender(<ChatThread>{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(100);
    expect(screen.getByRole('button', { name: 'Jump to newest' })).toBeInTheDocument();
  });

  it('counts a reader within followThreshold as at the newest message', () => {
    renderThemed(<ChatThread followThreshold={150}>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 700);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
    scrollLogTo(log, 600);
    expect(screen.getByRole('button', { name: 'Jump to newest' })).toBeInTheDocument();
  });

  it('jumps and moves focus to the log when Jump to newest is pressed', () => {
    renderThemed(<ChatThread jumpLabel="Latest">{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    const scrollTo = mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    fireEvent.click(screen.getByRole('button', { name: 'Latest' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    expect(screen.queryByRole('button', { name: 'Latest' })).not.toBeInTheDocument();
    expect(log).toHaveFocus();
  });

  it('does not show the button again while the smooth jump passes by', () => {
    renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to newest' }));
    scrollLogTo(log, 300);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
    scrollLogTo(log, 800);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
  });

  it('jumps without animation under reduced motion', () => {
    document.documentElement.setAttribute('data-reduced-motion', 'reduce');
    renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    const scrollTo = mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to newest' }));
    expect(scrollTo).not.toHaveBeenCalled();
    expect(log.scrollTop).toBe(1000);
  });

  it('lets go of the newest message on small upward scroll steps while content grows', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800, scrollHeight: 1000 });
    scrollLogTo(log, 800);
    for (let step = 1; step <= 5; step += 1) {
      const before = log.scrollTop;
      // One arrow-key sized step up: the reader is still within the 64px threshold at first.
      scrollLogTo(log, before - 20);
      setHeight(log, 1000 + step * 50);
      rerender(<ChatThread>{messages(2 + step)}</ChatThread>);
      expect(log.scrollTop).toBe(before - 20);
    }
    // By now the newest message is out of reach, and the button says so.
    expect(screen.getByRole('button', { name: 'Jump to newest' })).toBeInTheDocument();
  });

  it.each([
    ['ArrowUp', (log: HTMLElement) => fireEvent.keyDown(log, { key: 'ArrowUp' })],
    ['PageUp', (log: HTMLElement) => fireEvent.keyDown(log, { key: 'PageUp' })],
    ['Home', (log: HTMLElement) => fireEvent.keyDown(log, { key: 'Home' })],
    ['Shift+Space', (log: HTMLElement) => fireEvent.keyDown(log, { key: ' ', shiftKey: true })],
    ['a wheel up', (log: HTMLElement) => fireEvent.wheel(log, { deltaY: -40 })],
    [
      'a swipe down',
      (log: HTMLElement) => {
        fireEvent.touchStart(log, { touches: [{ clientY: 100 }] });
        fireEvent.touchMove(log, { touches: [{ clientY: 140 }] });
      },
    ],
  ])('stops following as soon as the reader asks to go up with %s, before any scroll event', (_name, intend) => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800, scrollHeight: 1000 });
    scrollLogTo(log, 800);
    intend(log);
    // A commit lands before the browser reports the scroll.
    setHeight(log, 1100);
    rerender(<ChatThread>{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(800);
  });

  it.each([
    ['ArrowDown', (log: HTMLElement) => fireEvent.keyDown(log, { key: 'ArrowDown' })],
    ['End', (log: HTMLElement) => fireEvent.keyDown(log, { key: 'End' })],
    ['a wheel down', (log: HTMLElement) => fireEvent.wheel(log, { deltaY: 40 })],
    [
      'a swipe up',
      (log: HTMLElement) => {
        fireEvent.touchStart(log, { touches: [{ clientY: 140 }] });
        fireEvent.touchMove(log, { touches: [{ clientY: 100 }] });
      },
    ],
  ])('keeps following when the reader scrolls down with %s', (_name, intend) => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800, scrollHeight: 1000 });
    scrollLogTo(log, 800);
    intend(log);
    setHeight(log, 1100);
    rerender(<ChatThread>{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(1100);
  });

  it('keeps following when there is nothing above to scroll to', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(1)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 0, scrollHeight: 200 });
    fireEvent.keyDown(log, { key: 'ArrowUp' });
    fireEvent.wheel(log, { deltaY: -40 });
    setHeight(log, 600);
    rerender(<ChatThread>{messages(2)}</ChatThread>);
    expect(log.scrollTop).toBe(600);
  });

  it('follows again only once the reader is back within the threshold', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800, scrollHeight: 1000 });
    scrollLogTo(log, 800);

    // Up by 30px: inside the threshold but let go of.
    scrollLogTo(log, 770);
    setHeight(log, 1100);
    rerender(<ChatThread>{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(770);

    // Down again, but still 80px from the bottom: stays put.
    scrollLogTo(log, 820);
    setHeight(log, 1200);
    rerender(<ChatThread>{messages(4)}</ChatThread>);
    expect(log.scrollTop).toBe(820);

    // Down to within 64px of the bottom: the thread follows again.
    scrollLogTo(log, 950);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
    setHeight(log, 1300);
    rerender(<ChatThread>{messages(5)}</ChatThread>);
    expect(log.scrollTop).toBe(1300);
  });

  it('does not treat a position clamped by a shrinking list as the reader scrolling up', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(3)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800, scrollHeight: 1000 });
    scrollLogTo(log, 800);
    // The list gets shorter and the browser pulls the position down with it.
    setHeight(log, 900);
    scrollLogTo(log, 700);
    setHeight(log, 1200);
    rerender(<ChatThread>{messages(4)}</ChatThread>);
    expect(log.scrollTop).toBe(1200);
  });

  it('disconnects the observer and clears the jump timer on unmount', () => {
    vi.useFakeTimers();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect = disconnect;
      },
    );
    const { unmount } = renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to newest' }));
    // The jump leaves a release timer pending; unmounting must clear it.
    const pending = vi.getTimerCount();
    expect(pending).toBeGreaterThan(0);
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBeLessThan(pending);
  });

  it('jumps without animation when the system asks for reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    renderThemed(<ChatThread>{messages(2)}</ChatThread>);
    const log = screen.getByRole('log');
    const scrollTo = mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to newest' }));
    expect(scrollTo).not.toHaveBeenCalled();
    expect(log.scrollTop).toBe(1000);
  });

  it('scrolls to newest when scrollKey changes, even when scrolled up', () => {
    const { rerender } = renderThemed(
      <ChatThread scrollKey="a">{messages(2)}</ChatThread>,
    );
    const log = screen.getByRole('log');
    mockScroll(log, { scrollTop: 800 });
    scrollLogTo(log, 100);
    rerender(<ChatThread scrollKey="a">{messages(3)}</ChatThread>);
    expect(log.scrollTop).toBe(100);
    rerender(<ChatThread scrollKey="b">{messages(4)}</ChatThread>);
    expect(log.scrollTop).toBe(1000);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
  });

  it('shows the empty slot with no messages, and no jump button', () => {
    const { rerender } = renderThemed(
      <ChatThread empty={<EmptyState compact title="Start a chat" />} />,
    );
    expect(screen.getByRole('heading', { name: 'Start a chat' })).toBeInTheDocument();
    mockScroll(screen.getByRole('log'));
    scrollLogTo(screen.getByRole('log'), 0);
    expect(screen.queryByRole('button', { name: 'Jump to newest' })).not.toBeInTheDocument();
    rerender(
      <ChatThread empty={<EmptyState compact title="Start a chat" />}>{messages(1)}</ChatThread>,
    );
    expect(screen.queryByRole('heading', { name: 'Start a chat' })).not.toBeInTheDocument();
    expect(screen.getByText('Message 1')).toBeInTheDocument();
  });

  it('in manual mode the log is silent and the announcement is a polite status', () => {
    const { rerender } = renderThemed(<ChatThread>{messages(1)}</ChatThread>);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'off');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    rerender(<ChatThread announcement="Upmo replied: All 142 invoices are matched.">{messages(1)}</ChatThread>);
    expect(screen.getByRole('status')).toHaveTextContent('Upmo replied: All 142 invoices are matched.');
  });

  it('clears the announcement after it is read, so the old line leaves the reading order', () => {
    vi.useFakeTimers();
    renderThemed(<ChatThread announcement="Upmo replied.">{messages(1)}</ChatThread>);
    expect(screen.getByRole('status')).toHaveTextContent('Upmo replied.');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Upmo replied.');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('speaks identical text again for a later reply once the announcement was reset between', () => {
    vi.useFakeTimers();
    const { rerender } = renderThemed(<ChatThread announcement="Upmo replied.">{messages(1)}</ChatThread>);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    rerender(<ChatThread busy>{messages(2)}</ChatThread>);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    rerender(<ChatThread announcement="Upmo replied.">{messages(2)}</ChatThread>);
    expect(screen.getByRole('status')).toHaveTextContent('Upmo replied.');
  });

  it('with announce="additions" the log announces new messages and has no status region', () => {
    renderThemed(
      <ChatThread announce="additions" announcement="ignored">
        {messages(1)}
      </ChatThread>,
    );
    expect(screen.getByRole('log')).not.toHaveAttribute('aria-live', 'off');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<ChatThread>{messages(1)}</ChatThread>, theme);
      expect(screen.getByRole('log', { name: 'Messages' })).toBeInTheDocument();
      unmount();
    }
  });
});
