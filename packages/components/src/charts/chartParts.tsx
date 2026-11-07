import { VisuallyHidden } from '@mantine/core';
import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { DASH, type MarkerShape, type PatternKind } from './chartKit.ts';

/** An id that is safe inside url(#...) and CSS selectors. */
export function useSafeId(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

const MIN_WIDTH = 120;

/**
 * The drawing width in px. It starts at `fallback` (also what a server render
 * and a layout-less test see) and follows the container, so the viewBox is the
 * real size and labels keep their size while the chart scales.
 */
export function useChartWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No layout (server render, jsdom, a hidden tab): follow the fallback prop.
    const measure = () => {
      const w = Math.round(el.clientWidth);
      setWidth(w > 0 ? w : fallback);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);

  return [ref, Math.max(MIN_WIDTH, width)] as const;
}

/**
 * Keyboard and pointer navigation over `count` positions (x steps, groups or
 * slices). Focusing the chart shows the first; the arrow keys, Home and End move
 * through them; hovering a position shows it too. Spread `figureProps` on the
 * focusable figure.
 */
export function useChartNav(count: number) {
  const [raw, setRaw] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const active = raw !== null && raw < count ? raw : null;

  const figureProps = {
    tabIndex: count > 0 ? 0 : undefined,
    onFocus: (e: FocusEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      setFocused(true);
      setRaw((r) => r ?? 0);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      setFocused(false);
      setRaw(null);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget || count === 0) return;
      let next: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = active === null ? 0 : Math.min(count - 1, active + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = active === null ? count - 1 : Math.max(0, active - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = count - 1;
          break;
        case 'Escape':
          setRaw(null);
          return;
        default:
          return;
      }
      e.preventDefault();
      setRaw(next);
    },
  };

  const hover = useCallback((index: number) => setRaw(index), []);
  const leave = useCallback(() => {
    if (!focused) setRaw(null);
  }, [focused]);

  return { active, focused, figureProps, hover, leave };
}

// --- Marks ----------------------------------------------------------------------

export function Marker({
  shape,
  cx,
  cy,
  r,
  className,
  style,
}: {
  shape: MarkerShape;
  cx: number;
  cy: number;
  r: number;
  className?: string;
  style?: CSSProperties;
}) {
  const common = { className, style, 'data-marker': shape };
  switch (shape) {
    case 'square':
      return <rect {...common} x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={1} />;
    case 'triangle':
      return (
        <polygon
          {...common}
          points={`${cx},${cy - r * 1.2} ${cx + r * 1.15},${cy + r * 0.9} ${cx - r * 1.15},${cy + r * 0.9}`}
        />
      );
    case 'diamond':
      return (
        <polygon
          {...common}
          points={`${cx},${cy - r * 1.3} ${cx + r * 1.3},${cy} ${cx},${cy + r * 1.3} ${cx - r * 1.3},${cy}`}
        />
      );
    default:
      return <circle {...common} cx={cx} cy={cy} r={r} />;
  }
}

/** The fill for a bar or slice: the plain colour, or a texture in that colour. */
export const fillFor = (id: string, kind: PatternKind, color: string) =>
  kind === 'solid' ? color : `url(#${id})`;

/** A hatch or dot texture in `color`, cut with the surface colour, for fills that must not rely on colour alone. */
export function PatternDef({ id, color, kind }: { id: string; color: string; kind: PatternKind }) {
  if (kind === 'solid') return null;
  const rotate = kind === 'stripe' ? 'rotate(45)' : kind === 'stripe-back' ? 'rotate(-45)' : undefined;
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={rotate}>
      <rect width="6" height="6" style={{ fill: color }} />
      {kind === 'stripe' || kind === 'stripe-back' ? (
        <rect className="upmo-chart__pattern-ink" width="2" height="6" />
      ) : null}
      {kind === 'dots' ? <circle className="upmo-chart__pattern-ink" cx="3" cy="3" r="1.3" /> : null}
      {kind === 'lines' ? <rect className="upmo-chart__pattern-ink" y="2" width="6" height="2" /> : null}
      {kind === 'grid' ? (
        <>
          <rect className="upmo-chart__pattern-ink" width="6" height="1.5" />
          <rect className="upmo-chart__pattern-ink" width="1.5" height="6" />
        </>
      ) : null}
    </pattern>
  );
}

/** The legend mark: the same marker and dash, or the same texture, the plot uses. */
export function Swatch({
  kind,
  color,
  marker = 'circle',
  dashed = false,
  pattern = 'solid',
}: {
  kind: 'line' | 'bar';
  color: string;
  marker?: MarkerShape;
  dashed?: boolean;
  pattern?: PatternKind;
}) {
  const id = `${useSafeId()}-sw`;
  if (kind === 'line') {
    return (
      <svg className="upmo-chart__swatch" width="28" height="12" viewBox="0 0 28 12" aria-hidden="true" data-kind="line">
        <line
          x1="1"
          x2="27"
          y1="6"
          y2="6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={dashed ? DASH : undefined}
          style={{ stroke: color }}
        />
        <Marker shape={marker} cx={14} cy={6} r={3.5} className="upmo-chart__marker" style={{ fill: color }} />
      </svg>
    );
  }
  return (
    <svg className="upmo-chart__swatch" width="14" height="12" viewBox="0 0 14 12" aria-hidden="true" data-kind="bar">
      <defs>
        <PatternDef id={id} color={color} kind={pattern} />
      </defs>
      <rect x="0" y="1" width="14" height="10" rx="2" style={{ fill: fillFor(id, pattern, color) }} />
    </svg>
  );
}

// --- Text parts -----------------------------------------------------------------

export interface ReadoutData {
  label: string;
  items: { name: string; value: string }[];
}

/**
 * The line that names the focused or hovered position and its values. It is a
 * polite live region while the chart has keyboard focus, so arrowing along the
 * chart reads each position out.
 */
export function ChartReadout({ data, live }: { data: ReadoutData | null; live: boolean }) {
  const items = data ? data.items.map((i) => (i.name ? `${i.name} ${i.value}` : i.value)).join(', ') : '';
  return (
    <div className="upmo-chart__readout" aria-live={live ? 'polite' : 'off'} aria-atomic="true">
      {data ? (
        <>
          <strong className="upmo-chart__readout-label">{data.label}</strong>
          {items ? `: ${items}` : null}
        </>
      ) : null}
    </div>
  );
}

export function EmptyChart({ text }: { text: string }) {
  return <p className="upmo-chart__empty">{text}</p>;
}

/** Every data point as a visually hidden table, captioned with the chart title. */
export function ChartDataTable({
  title,
  labelHeader = 'Label',
  labels,
  columns,
}: {
  title: string;
  labelHeader?: string;
  labels: readonly string[];
  columns: readonly { name: string; cells: readonly string[] }[];
}) {
  return (
    <VisuallyHidden>
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            {columns.map((c, ci) => (
              <th scope="col" key={ci}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={i}>
              <th scope="row">{label}</th>
              {columns.map((c, ci) => (
                <td key={ci}>{c.cells[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </VisuallyHidden>
  );
}

export function ChartLegendList({ items, className }: { items: { name: string; swatch: ReactNode }[]; className?: string }) {
  return (
    <ul className={clsx('upmo-chart__legend-list', className)}>
      {items.map((item, i) => (
        <li key={i} className="upmo-chart__legend-item">
          {item.swatch}
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  );
}

// --- Axes -----------------------------------------------------------------------

export function YAxis({
  ticks,
  y,
  gridFrom,
  gridTo,
  labelX,
  anchor,
  format,
  grid = true,
}: {
  ticks: readonly number[];
  y: (v: number) => number;
  gridFrom: number;
  gridTo: number;
  labelX: number;
  anchor: 'start' | 'end';
  format: (n: number) => string;
  grid?: boolean;
}) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          {grid ? (
            <line
              className={clsx('upmo-chart__grid', t === 0 && 'upmo-chart__grid--zero')}
              x1={gridFrom}
              x2={gridTo}
              y1={y(t)}
              y2={y(t)}
            />
          ) : null}
          <text className="upmo-chart__tick" x={labelX} y={y(t)} dy="0.32em" textAnchor={anchor}>
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

export function XLabels({
  labels,
  x,
  baseline,
  step,
  firstAnchor = 'middle',
}: {
  labels: readonly string[];
  x: (i: number) => number;
  baseline: number;
  step: number;
  /** Anchor of the first label. 'start' keeps it from reaching left of its x, into a label column. Default 'middle'. */
  firstAnchor?: 'start' | 'middle';
}) {
  return (
    <g>
      {labels.map((label, i) =>
        i % step === 0 ? (
          <text
            key={i}
            className="upmo-chart__tick upmo-chart__tick--x"
            x={x(i)}
            y={baseline}
            textAnchor={i === 0 ? firstAnchor : 'middle'}
          >
            {label}
          </text>
        ) : null,
      )}
    </g>
  );
}
