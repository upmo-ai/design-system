import { IconPlug, IconServer } from '@tabler/icons-react';
import { aliases, marks } from '@upmo-ai/brands';
import clsx from 'clsx';

export type BrandKind = 'connector' | 'provider';

export interface BrandMarkProps {
  /**
   * The brand id, e.g. "github", "slack", "anthropic". Case-insensitive. Common
   * alternative ids resolve to the same mark ("gemini" for "googlegemini",
   * "google-drive" for "googledrive"); see `aliases` in @upmo-ai/brands.
   */
  brand: string;
  /** Pixel size. Default 24. */
  size?: number;
  /**
   * Fallback glyph when the brand is unknown: "connector" shows a plug,
   * "provider" shows a server. Default "connector".
   */
  kind?: BrandKind;
  /**
   * Force the mark to render in the current text colour instead of its official
   * brand colours (e.g. for a monochrome toolbar). Default false (colourful).
   */
  monochrome?: boolean;
  className?: string;
}

const own = (record: Record<string, string>, key: string): string | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;

/** The mark markup for an id or alias, case-insensitive; undefined when unknown. */
function markFor(brand: string): string | undefined {
  const key = brand.trim().toLowerCase();
  const alias = own(aliases, key);
  return own(marks, key) ?? (alias === undefined ? undefined : own(marks, alias));
}

/**
 * BrandMark renders a service's official mark (connectors and providers) from
 * @upmo-ai/brands: the full set of colourful brand SVGs, inlined so they need no
 * network request. Marks are shown in their official colours by default; pass
 * monochrome to draw them in the current text colour. Ids are case-insensitive
 * and a few alternative ids resolve through the `aliases` map. Unknown brands
 * fall back to a generic plug (connector) or server (provider) glyph.
 */
export function BrandMark({
  brand,
  size = 24,
  kind = 'connector',
  monochrome,
  className,
}: BrandMarkProps) {
  const inner = markFor(brand);

  if (!inner) {
    const Fallback = kind === 'provider' ? IconServer : IconPlug;
    return <Fallback size={size} className={clsx('upmo-brandmark', className)} aria-hidden="true" />;
  }

  return (
    <svg
      className={clsx('upmo-brandmark', monochrome && 'upmo-brandmark--mono', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      // Deep/currentColor marks inherit this as their fill, so they adapt to the
      // theme (ink on any ground); colourful marks carry their own fill.
      style={{ color: 'var(--ink)' }}
      aria-hidden="true"
      // The mark markup comes from our own build-time generated @upmo-ai/brands
      // package (static, trusted), not user input.
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
