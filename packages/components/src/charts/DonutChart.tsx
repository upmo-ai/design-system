import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { MAX_SLICES, colorVar, percentTexts, toCell } from './chartKit.ts';
import { sliceNavPlan, donutOption, type DonutSlice } from './chartOptions.ts';
import {
  ChartDataTable,
  ChartLegend,
  ChartReadout,
  useChartNav,
  useFormatter,
  useHiddenSeries,
  useKeyed,
  useLegendHover,
} from './chartParts.tsx';
import type { ChartTheme } from './chartTheme.ts';
import { EChartFrame } from './EChartFrame.tsx';
import type { ECharts } from './echartsSetup.ts';

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
  /**
   * Value in the centre of the ring. Defaults to the formatted total. When the
   * reader hides a slice in the legend the centre shows the formatted total of
   * the slices still drawn instead.
   */
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

interface SliceRow extends DonutSlice {
  display: string;
}

/**
 * A donut chart drawn with ECharts (loaded lazily on first use). The legend beside
 * the ring gives every slice its label, value and share, rounded together so the
 * shares add up to 100%, and it is clickable: a slice can be hidden, and the shares
 * and the centre follow. Hover shows a tooltip; focus the chart and use the arrow
 * keys to step through slices. In high contrast the slices gain fill patterns. The
 * drawing is hidden from assistive tech; a visually hidden table (caption = title)
 * carries the data.
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
  const { fmt, signature } = useFormatter(formatValue);
  const chartRef = useRef<ECharts | null>(null);

  const dataKey = `${JSON.stringify([data, otherLabel])}|${signature}`;
  const cleaned = useKeyed(
    data.map((d) => ({ ...d, amount: Math.max(0, toCell(d.value) ?? 0) })),
    dataKey,
  );
  const slices = useKeyed<SliceRow[]>(
    [
      ...cleaned.slice(0, MAX_SLICES).map((d, i) => ({
        key: `d${i}`,
        label: d.label,
        amount: d.amount,
        display: d.display ?? fmt(d.amount),
        color: colorVar((i + 1) as 1 | 2 | 3 | 4 | 5),
      })),
      ...(cleaned.length > MAX_SLICES
        ? (() => {
            const amount = cleaned.slice(MAX_SLICES).reduce((sum, d) => sum + d.amount, 0);
            return [{ key: 'other', label: otherLabel, amount, display: fmt(amount), color: colorVar('mid') }];
          })()
        : []),
    ],
    dataKey,
  );

  const [hidden, toggle] = useHiddenSeries(slices.map((s) => s.label).join('\u0000'), slices.length);
  const visible = useKeyed(slices.filter((_, i) => !hidden.has(i)), `${dataKey}|${[...hidden].join(',')}`);
  const total = visible.reduce((sum, s) => sum + s.amount, 0);

  // Rounded together so the legend adds up to 100%; the table rounds all the
  // source items together, since it lists them before the Other merge.
  const visibleShares = useKeyed(percentTexts(visible.map((s) => s.amount)), `${dataKey}|${[...hidden].join(',')}`);
  const itemShares = percentTexts(cleaned.map((d) => d.amount));

  const nav = useChartNav(visible.length);

  const build = useCallback(
    (theme: ChartTheme) =>
      donutOption({ slices: visible, displays: visible.map((s) => s.display), shares: visibleShares }, theme),
    [visible, visibleShares],
  );
  const navPlan = useCallback((i: number) => sliceNavPlan(i), []);
  const legendTarget = useCallback(
    (i: number) =>
      hidden.has(i) ? null : { seriesIndex: 0, dataIndex: slices.slice(0, i).filter((_, k) => !hidden.has(k)).length },
    [hidden, slices],
  );
  const hover = useLegendHover(chartRef, legendTarget);

  const drawn = total > 0;
  const readout =
    nav.active === null || !visible[nav.active]
      ? null
      : {
          label: visible[nav.active].label,
          items: [{ name: '', value: `${visible[nav.active].display} (${visibleShares[nav.active]})` }],
        };

  let visibleIndex = -1;
  const legendItems = slices.map((s, i) => {
    const isHidden = hidden.has(i);
    if (!isHidden) visibleIndex += 1;
    return {
      color: s.color,
      name: s.label,
      hidden: isHidden,
      value: s.display,
      share: isHidden ? '' : visibleShares[visibleIndex],
    };
  });

  const centre = hidden.size > 0 || centerValue === undefined ? fmt(total) : centerValue;

  return (
    <figure
      className={clsx('upmo-donut', 'upmo-chart', className)}
      role="group"
      aria-label={label}
      {...nav.figureProps}
    >
      <div className="upmo-donut__body">
        <div className="upmo-donut__ring" style={{ width: size, maxWidth: '100%' }}>
          {drawn ? (
            <EChartFrame
              square
              height={size}
              width={size}
              build={build}
              chartRef={chartRef}
              active={nav.active}
              navPlan={navPlan}
            />
          ) : (
            <div className="upmo-donut__empty-ring" aria-hidden="true" />
          )}
          <div className="upmo-donut__center">
            {drawn ? (
              <>
                <span className="upmo-donut__center-label">{centerLabel}</span>
                <span className="upmo-donut__center-value">{centre}</span>
              </>
            ) : (
              <span className="upmo-donut__center-label">{emptyText}</span>
            )}
          </div>
        </div>
        {slices.length > 0 ? (
          <ChartLegend
            label={`${label} slices`}
            layout="rows"
            items={legendItems}
            onToggle={toggle}
            onHover={hover}
          />
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
