import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface KbdProps {
  /** The key label: a symbol (⌘, ⇧) or a word (Enter, Esc). */
  children: ReactNode;
  className?: string;
}

/**
 * A keyboard key cap for shortcuts in menus, tooltips and hint lines. Mono, a
 * surface-100 ground with a border-strong edge and a 2px bottom edge for the
 * key-cap look, radius-xs. Never clickable.
 *
 * A group of keys is separate Kbd elements (no "+" sign); wrap them in
 * `KbdGroup` for the small gap.
 */
export function Kbd({ children, className }: KbdProps) {
  return <kbd className={clsx('upmo-kbd', className)}>{children}</kbd>;
}

export interface KbdGroupProps {
  children: ReactNode;
  className?: string;
}

/** A row of Kbd keys with the small gap between them. */
export function KbdGroup({ children, className }: KbdGroupProps) {
  return <span className={clsx('upmo-kbd-group', className)}>{children}</span>;
}
