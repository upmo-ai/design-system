import clsx from 'clsx';
import {
  MAX_SLICES,
  arcPath,
  colorVar,
  defaultFormat,
  patternAt,
  percentTexts,
  toCell,
} from './chartKit.ts';
import {
  ChartDataTable,
  ChartReadout,
  PatternDef,
  Swatch,
  fillFor,
  useChartNav,
  useSafeId,
} from './chartParts.tsx';

export interface DonutDatum {
  label: string;
  /** Zero or more. Negative and non-finite values count as zero. */
  value: number;
  /** Optional pre-formatted value for the legend, readout and data table. Defaults to formatValue. */
  display?: string;
}

export interface DonutChartProps {
  /**
   * The slices, in the order you want them drawn, clockwise from the top. The
   * first five are kept; every slice after them is summed into one "Other" slice
   * in chart-mid. Sort largest first to keep the largest five.
   */
  data: DonutDatum[];
  /** Accessible title for the chart. */
  title?: string;
  /** Small label in the centre of the ring. Default "Total". */
  centerLabel?: string;
  /** Value in the centre of the ring. Defaults to the formatted total. */
  centerValue?: string;
  /** Diameter in px. The ring scales down to fit a narrow container. Default 200. */
  size?: number;
  /** Formats values that have no `display`. */
  formatValue?: (n: number) => string;
  /** Name of the merged slice. Default "Other". */
  otherLabel?: string;
  /** Text in the empty ring when the total is zero. Default "No data to show". */
  emptyText?: string;
  className?: string;
}

/**
 * A dependency-free donut chart drawn as SVG. A legend list beside the ring gives
 * every slice its label, value and share, so the ring is never read by colour
 * alone: slices also carry a fill texture, repeated in the legend. Hover, or
 * focus the chart and use the arrow keys, to read a slice. The SVG is hidden from
 * assistive tech; a visually hidden table (caption = title) carries the data.
 */
export function DonutChart({
  data,
  title,
  centerLabel = 'Total',
  centerValue,
  size = 200,
  formatValue,
  otherLabel = 'Other',
  emptyText = 'No data to show',
  className,
}: DonutChartProps) {
  const label = title ?? 'Donut chart';
  const fmt = formatValue ?? defaultFormat;
  const uid = useSafeId();

  const cleaned = data.map((d) => ({ ...d, amount: Math.max(0, toCell(d.value) ?? 0) }));
  const total = cleaned.reduce((sum, d) => sum + d.amount, 0);
  const slices = [
    ...cleaned.slice(0, MAX_SLICES).map((d, i) => ({
      label: d.label,
      amount: d.amount,
      display: d.display ?? fmt(d.amount),
      color: colorVar((i + 1) as 1 | 2 | 3 | 4 | 5),
    })),
    ...(cleaned.length > MAX_SLICES
      ? (() => {
          const amount = cleaned.slice(MAX_SLICES).reduce((sum, d) => sum + d.amount, 0);
          return [{ label: otherLabel, amount, display: fmt(amount), color: colorVar('mid') }];
        })()
      : []),
  ];
  const nav = useChartNav(slices.length);
  // Rounded together so the legend adds up to 100%; the table rounds all the
  // source items together, since it lists them before the Other merge.
  const sliceShares = percentTexts(slices.map((s) => s.amount));
  const itemShares = percentTexts(cleaned.map((d) => d.amount));

  const rOuter = size / 2 - 2;
  const thickness = rOuter * 0.34;
  const rInner = rOuter - thickness;
  const c = size / 2;

  let cumulative = 0;
  const arcs = slices.map((s, i) => {
    const a0 = (cumulative / total) * Math.PI * 2;
    cumulative += s.amount;
    const a1 = (cumulative / total) * Math.PI * 2;
    return { s, i, a0, a1 };
  });

  const readout =
    nav.active === null
      ? null
      : {
          label: slices[nav.active].label,
          items: [
            {
              name: '',
              value: `${slices[nav.active].display} (${sliceShares[nav.active]})`,
            },
          ],
        };

  return (
    <figure
      className={clsx('upmo-donut', 'upmo-chart', className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <div className="upmo-donut__body">
        <div className="upmo-donut__ring" style={{ width: size, maxWidth: '100%' }}>
          <svg
            className="upmo-chart__svg"
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
            focusable="false"
            onMouseLeave={nav.leave}
          >
            <defs>
              {slices.map((s, i) => (
                <PatternDef key={i} id={`${uid}-s${i}`} color={s.color} kind={patternAt(i)} />
              ))}
            </defs>
            {total > 0 ? (
              arcs
                .filter(({ s }) => s.amount > 0)
                .map(({ s, i, a0, a1 }) => (
                  <path
                    key={i}
                    className={clsx('upmo-donut__slice', nav.active === i && 'upmo-donut__slice--active')}
                    d={arcPath(c, c, rOuter, rInner, a0, a1)}
                    fillRule="evenodd"
                    data-slice={i}
                    style={{ fill: fillFor(`${uid}-s${i}`, patternAt(i), s.color) }}
                    onMouseEnter={() => nav.hover(i)}
                  />
                ))
            ) : (
              <circle
                className="upmo-donut__empty-ring"
                cx={c}
                cy={c}
                r={(rOuter + rInner) / 2}
                strokeWidth={thickness}
                fill="none"
              />
            )}
          </svg>
          <div className="upmo-donut__center">
            {total > 0 ? (
              <>
                <span className="upmo-donut__center-label">{centerLabel}</span>
                <span className="upmo-donut__center-value">{centerValue ?? fmt(total)}</span>
              </>
            ) : (
              <span className="upmo-donut__center-label">{emptyText}</span>
            )}
          </div>
        </div>
        {slices.length > 0 ? (
          <ul className="upmo-donut__legend">
            {slices.map((s, i) => (
              <li
                key={i}
                className={clsx('upmo-donut__row', nav.active === i && 'upmo-donut__row--active')}
                onMouseEnter={() => nav.hover(i)}
                onMouseLeave={nav.leave}
              >
                <Swatch kind="bar" color={s.color} pattern={patternAt(i)} />
                <span className="upmo-donut__name">{s.label}</span>
                <span className="upmo-donut__value">{s.display}</span>
                <span className="upmo-donut__pct">{sliceShares[i]}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <ChartReadout data={readout} live={nav.focused} />
      <ChartDataTable
        title={label}
        labels={cleaned.map((d) => d.label)}
        columns={[
          { name: 'Value', cells: cleaned.map((d) => d.display ?? fmt(d.amount)) },
          { name: 'Share', cells: itemShares },
        ]}
      />
    </figure>
  );
}
