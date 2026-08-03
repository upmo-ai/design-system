import { SimpleGrid, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
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
 */
export function BrandTileGrid({
  items,
  selectedId,
  onSelect,
  kind = 'connector',
  minTileWidth = 160,
  className,
}: BrandTileGridProps) {
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4 }}
      spacing="sm"
      className={clsx('upmo-brandgrid', className)}
      style={{ ['--upmo-tile-min' as string]: `${minTileWidth}px` }}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <UnstyledButton
            key={item.id}
            className={clsx('upmo-brandtile', selected && 'upmo-brandtile--selected')}
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
          >
            <span className="upmo-brandtile__mark">
              <BrandMark brand={item.id} size={28} kind={kind} />
            </span>
            <span className="upmo-brandtile__name">{item.name}</span>
            {item.adapter ? <span className="upmo-brandtile__adapter">{item.adapter}</span> : null}
            {item.description ? (
              <span className="upmo-brandtile__desc">{item.description}</span>
            ) : null}
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}
