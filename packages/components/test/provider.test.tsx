import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UpmoProvider, useUpmoTheme } from '../src/index.ts';

// A controllable matchMedia: tests flip a query and fire its change listeners,
// as the OS would when the user switches dark mode or contrast.
const matches = new Map<string, boolean>();
const listeners = new Map<string, Set<(event: { matches: boolean }) => void>>();
const realMatchMedia = window.matchMedia;

function setMedia(query: string, value: boolean) {
  matches.set(query, value);
  for (const listener of listeners.get(query) ?? []) listener({ matches: value });
}

beforeEach(() => {
  matches.clear();
  listeners.clear();
  window.matchMedia = (query: string) =>
    ({
      get matches() {
        return matches.get(query) ?? false;
      },
      media: query,
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(listener);
      },
      removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
        listeners.get(query)?.delete(listener);
      },
    }) as unknown as MediaQueryList;
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

const root = document.documentElement;

function Resolved() {
  return <span>{useUpmoTheme()}</span>;
}

describe('UpmoProvider', () => {
  it('writes an explicit theme onto the root and forces the Mantine scheme', () => {
    const { rerender } = render(<UpmoProvider theme="dark" />);
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(root).toHaveAttribute('data-mantine-color-scheme', 'dark');
    rerender(<UpmoProvider theme="hc" />);
    expect(root).toHaveAttribute('data-theme', 'hc');
    expect(root).toHaveAttribute('data-mantine-color-scheme', 'light');
  });

  it('follows the OS by default and live-updates on media change', () => {
    render(
      <UpmoProvider>
        <Resolved />
      </UpmoProvider>,
    );
    expect(root).toHaveAttribute('data-theme', 'light');
    act(() => setMedia('(prefers-color-scheme: dark)', true));
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(root).toHaveAttribute('data-mantine-color-scheme', 'dark');
    expect(screen.getByText('dark')).toBeInTheDocument();
    // More contrast wins over dark, on Mantine's light base.
    act(() => setMedia('(prefers-contrast: more)', true));
    expect(root).toHaveAttribute('data-theme', 'hc');
    expect(root).toHaveAttribute('data-mantine-color-scheme', 'light');
    expect(screen.getByText('hc')).toBeInTheDocument();
  });

  it('resolves a dark OS on the first render, with no light flash', () => {
    matches.set('(prefers-color-scheme: dark)', true);
    render(
      <UpmoProvider theme="system">
        <Resolved />
      </UpmoProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('sets the reduced-motion attribute only for the in-app reduce setting', () => {
    const { rerender, unmount } = render(<UpmoProvider reducedMotion="reduce" />);
    expect(root).toHaveAttribute('data-reduced-motion', 'reduce');
    rerender(<UpmoProvider reducedMotion="system" />);
    expect(root).not.toHaveAttribute('data-reduced-motion');
    rerender(<UpmoProvider reducedMotion="reduce" />);
    unmount();
    expect(root).not.toHaveAttribute('data-reduced-motion');
    expect(root).not.toHaveAttribute('data-theme');
  });
});
