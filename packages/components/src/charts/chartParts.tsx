import { VisuallyHidden } from '@mantine/core';
import clsx from 'clsx';
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react';
import { defaultFormat } from './chartKit.ts';
import type { ECharts } from './echartsSetup.ts';

/**
 * Keyboard navigation over `count` positions (x steps, groups or slices).
 * Focusing the chart shows the first; the arrow keys, Home and End move through
 * them and Escape clears. The position drives the live readout line and, through
 * EChartFrame, the tooltip and highlight. Pointer hover is ECharts' own tooltip.
 * Spread `figureProps` on the focusable figure.
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

  return { active, focused, figureProps };
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

// --- Legend ---------------------------------------------------------------------

const NONE: ReadonlySet<number> = new Set();

/**
 * Which series the reader has hidden through the legend, by position. The set
 * resets when `signature` (the series names) changes, and the last visible series
 * can never be hidden.
 */
export function useHiddenSeries(signature: string, total: number) {
  const [state, setState] = useState<{ signature: string; hidden: ReadonlySet<number> }>({
    signature,
    hidden: NONE,
  });
  const hidden = state.signature === signature ? state.hidden : NONE;

  const toggle = useCallback(
    (index: number) =>
      setState((prev) => {
        const current = prev.signature === signature ? prev.hidden : NONE;
        const next = new Set(current);
        if (next.has(index)) next.delete(index);
        else if (total - next.size > 1) next.add(index);
        else return prev;
        return { signature, hidden: next };
      }),
    [signature, total],
  );

  return [hidden, toggle] as const;
}

export interface LegendEntry {
  /** The series colour as a CSS value, normally `var(--chart-N)`. */
  color: string;
  name: string;
  hidden: boolean;
  /** Small labelled figures after the name, such as Mean and Max. */
  stats?: { label: string; value: string }[];
  /** The ring legend's value and share columns. */
  value?: string;
  share?: string;
}

type DotStyle = CSSProperties & { '--upmo-dot': string };

/**
 * A compact legend that also toggles series. Each item is a button: Enter or
 * Space (or a click) hides or shows its series, and the last visible one stays.
 * Hovering or focusing an item highlights its series in the plot. A hidden item
 * is struck through and its swatch is hollow, so state never rests on colour.
 */
export function ChartLegend({
  items,
  label,
  layout = 'inline',
  onToggle,
  onHover,
}: {
  items: readonly LegendEntry[];
  /** Names the list for assistive technology. */
  label: string;
  /** 'inline' wraps items; 'rows' is the donut's column of name, value and share. */
  layout?: 'inline' | 'rows';
  onToggle: (index: number) => void;
  /** Called with the item's position on hover or focus, and null on leave or blur. */
  onHover?: (index: number | null) => void;
}) {
  const visible = items.filter((i) => !i.hidden).length;
  return (
    <ul className={clsx('upmo-chart__legend-list', layout === 'rows' && 'upmo-chart__legend-list--rows')} aria-label={label}>
      {items.map((item, i) => (
        <li key={i} className="upmo-chart__legend-item">
          <button
            type="button"
            className="upmo-chart__legend-button"
            aria-pressed={!item.hidden}
            aria-disabled={!item.hidden && visible <= 1 ? true : undefined}
            onClick={() => onToggle(i)}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(i)}
            onBlur={() => onHover?.(null)}
          >
            <span className="upmo-chart__dot" style={{ '--upmo-dot': item.color } as DotStyle} aria-hidden="true" />
            <span className="upmo-chart__legend-name">{item.name}</span>
            {item.value !== undefined ? <span className="upmo-chart__legend-value">{item.value}</span> : null}
            {item.share !== undefined ? <span className="upmo-chart__legend-share">{item.share}</span> : null}
          </button>
          {item.stats ? (
            <span className="upmo-chart__legend-stats">
              {item.stats.map((s) => (
                <span key={s.label} className="upmo-chart__legend-stat">
                  {s.label} <span className="upmo-chart__legend-stat-value">{s.value}</span>
                </span>
              ))}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

// --- Stable inputs ----------------------------------------------------------------

/**
 * Returns `value` from the last render where `key` changed. Callers often pass
 * fresh arrays and arrow functions on every render; keying on content means the
 * chart is redrawn only when the data really changes, so an open tooltip is not
 * closed by an unrelated parent render.
 */
export function useKeyed<T>(value: T, key: string): T {
  const ref = useRef({ key, value });
  if (ref.current.key !== key) ref.current = { key, value };
  return ref.current.value;
}

const PROBES = [0, 1, 12.5, 1234.5, 1_000_000, -3];

/**
 * An identity-stable formatter that always calls the latest `formatValue`, and a
 * signature of what it prints for a few probe values. The signature changes when
 * the caller's formatting really changes, even if the function is new every render.
 */
export function useFormatter(formatValue: ((n: number) => string) | undefined) {
  const latest = useRef(formatValue);
  latest.current = formatValue;
  const fmt = useCallback((n: number) => (latest.current ?? defaultFormat)(n), []);
  const given = formatValue !== undefined;
  const signature = formatValue ? PROBES.map((p) => formatValue(p)).join('\u0001') : '';
  return { fmt, given, signature };
}

/**
 * Highlights a series in the plot while its legend item is hovered or focused.
 * `target` maps an item position to the action fields that select its series
 * (null when it is hidden).
 */
export function useLegendHover(
  chartRef: MutableRefObject<ECharts | null>,
  target: (index: number) => Record<string, unknown> | null,
) {
  const last = useRef<Record<string, unknown> | null>(null);
  return useCallback(
    (index: number | null) => {
      const chart = chartRef.current;
      if (!chart) return;
      if (last.current) {
        chart.dispatchAction({ ...last.current, type: 'downplay' });
        last.current = null;
      }
      if (index === null) return;
      const fields = target(index);
      if (!fields) return;
      chart.dispatchAction({ ...fields, type: 'highlight' });
      last.current = fields;
    },
    [chartRef, target],
  );
}
