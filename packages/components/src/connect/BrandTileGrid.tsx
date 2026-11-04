import { SimpleGrid, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { useId } from 'react';
import { BrandMark, type BrandKind } from '../brand/BrandMark.tsx';

export interface BrandTileItem {
  id: string;
  name: string;
  description?: string;
  /** Optional secondary label (e.g. a provider adapter). */
  adapter?: string;
}

export interface BrandTileGridProps {
  items: BrandTileItem[];
  /** The selected tile id. */
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Fallback glyph kind for unknown brands. */
  kind?: BrandKind;
  /** Minimum tile width before wrapping. Default 160. */
  minTileWidth?: number;
  className?: string;
}

/**
 * BrandTileGrid is the "pick a service" step of a connect flow: a responsive
 * grid of selectable brand tiles, each a brand mark, name and short
 * description. The selected tile gets the emerald selected ground and is marked
 * aria-pressed, so selection is clear to pointer and assistive tech alike.
 *
 * A tile's accessible name is the brand name alone (so `getByRole('button',
 * { name: 'OpenAI' })` finds it); the adapter and description are its
 * accessible description.
 */
export function BrandTileGrid({
  items,
  selectedId,
  onSelect,
  kind = 'connector',
  minTileWidth = 160,
  className,
}: BrandTileGridProps) {
  const baseId = useId();
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4 }}
      spacing="sm"
      className={clsx('upmo-brandgrid', className)}
      style={{ ['--upmo-tile-min' as string]: `${minTileWidth}px` }}
    >
      {items.map((item, index) => {
        const selected = item.id === selectedId;
        const nameId = `${baseId}-${index}-name`;
        const adapterId = `${baseId}-${index}-adapter`;
        const descId = `${baseId}-${index}-desc`;
        const describedBy = [item.adapter ? adapterId : null, item.description ? descId : null]
          .filter(Boolean)
          .join(' ');
        return (
          <UnstyledButton
            key={item.id}
            className={clsx('upmo-brandtile', selected && 'upmo-brandtile--selected')}
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
            aria-labelledby={nameId}
            aria-describedby={describedBy || undefined}
          >
            <span className="upmo-brandtile__mark">
              <BrandMark brand={item.id} size={28} kind={kind} />
            </span>
            <span id={nameId} className="upmo-brandtile__name">
              {item.name}
            </span>
            {item.adapter ? (
              <span id={adapterId} className="upmo-brandtile__adapter">
                {item.adapter}
              </span>
            ) : null}
            {item.description ? (
              <span id={descId} className="upmo-brandtile__desc">
                {item.description}
              </span>
            ) : null}
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}
