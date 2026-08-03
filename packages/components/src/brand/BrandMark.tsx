import { IconPlug, IconServer } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export type BrandKind = 'connector' | 'provider';

export interface BrandMarkProps {
  /** The brand id, e.g. "github", "slack", "anthropic". Case-insensitive. */
  brand: string;
  /** Pixel size. Default 24. */
  size?: number;
  /**
   * Fallback glyph when the brand is unknown: "connector" shows a plug,
   * "provider" shows a server. Default "connector".
   */
  kind?: BrandKind;
  className?: string;
}

// A small registry of monochrome, currentColor brand glyphs. The product
// hardcodes an inline SVG per brand; we start with the common ones and fall back
// to a generic glyph for anything unknown, so a card always has a mark. Extend
// this map as brands are needed; each path is a single-colour silhouette.
const registry: Record<string, ReactNode> = {
  github: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  ),
  slack: (
    <path d="M6 15a2 2 0 1 1-2-2h2v2Zm1 0a2 2 0 0 1 4 0v5a2 2 0 0 1-4 0v-5Zm2-9a2 2 0 1 1 2-2v2H9Zm0 1a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4h5Zm9 2a2 2 0 1 1 2 2h-2v-2Zm-1 0a2 2 0 0 1-4 0V4a2 2 0 0 1 4 0v5Zm-2 9a2 2 0 1 1-2 2v-2h2Zm0-1a2 2 0 0 1 0-4h5a2 2 0 0 1 0 4h-5Z" />
  ),
  stripe: (
    <path d="M13.5 10.3c0-.6.5-.9 1.3-.9 1.1 0 2.6.4 3.7 1V6.9a9.6 9.6 0 0 0-3.7-.7c-3 0-5 1.6-5 4.2 0 4.1 5.6 3.4 5.6 5.2 0 .7-.6 1-1.5 1-1.2 0-2.8-.5-4-1.2v3.6c1.4.6 2.8.8 4 .8 3.1 0 5.2-1.5 5.2-4.2 0-4.4-5.6-3.6-5.6-5.3Z" />
  ),
  notion: (
    <path d="M5 4.5 15.5 3.7c1.1-.1 1.4.1 2 .6l2 1.6c.4.3.6.5.6 1v12.3c0 .8-.3 1.3-1.3 1.4l-11 .7c-.8 0-1.2-.1-1.6-.6l-1.5-2c-.4-.5-.6-.9-.6-1.4V5.8c0-.7.3-1.2 1.4-1.3Zm1 2v11.4l9.6-.6V6l-9.6.5Zm2.2 1.8 4.9-.3v1.5l-1.2.1v5.6l-1.5.1V9.5l-1 .1v5.7l-1.2.1V8.3Z" />
  ),
  anthropic: (
    <path d="M9.3 4H6.6L2 20h2.9l1-3.4h5l1 3.4H15L10.4 4H9.3Zm-2.7 9.5L8 8.2l1.4 5.3H6.6ZM18 4h3.8l-4.6 16h-2.8L18 4Z" />
  ),
  openai: (
    <path d="M12 3a4 4 0 0 1 3.6 2.2 4 4 0 0 1 2.7 6.2 4 4 0 0 1-2.7 6.4A4 4 0 0 1 12 21a4 4 0 0 1-3.6-2.2 4 4 0 0 1-2.7-6.4 4 4 0 0 1 2.7-6.2A4 4 0 0 1 12 3Zm0 4-3 1.7v3.6L12 14l3-1.7V8.7L12 7Z" />
  ),
};

/**
 * BrandMark renders a brand's monochrome glyph (connectors and providers). It
 * inherits the current text colour so it adapts to tone and theme. Unknown
 * brands fall back to a generic plug (connector) or server (provider) glyph, so
 * a card always shows a mark. The registry is intentionally small and extensible.
 */
export function BrandMark({ brand, size = 24, kind = 'connector', className }: BrandMarkProps) {
  const key = brand.trim().toLowerCase();
  const glyph = registry[key];

  if (!glyph) {
    const Fallback = kind === 'provider' ? IconServer : IconPlug;
    return <Fallback size={size} className={clsx('upmo-brandmark', className)} aria-hidden="true" />;
  }

  return (
    <svg
      className={clsx('upmo-brandmark', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}
