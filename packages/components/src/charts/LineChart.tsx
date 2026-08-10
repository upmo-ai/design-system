import clsx from 'clsx';
import { ChartTable } from './BarChart.tsx';

export interface LinePoint {
  label: string;
  value: number;
  /** Optional pre-formatted value for the data table. Defaults to value. */
  display?: string;
}

export interface LineChartProps {
  data: LinePoint[];
  /** Chart height in px. Default 160. */
  height?: number;
  /** Width in px for the viewBox. Default 480. */
  width?: number;
  title?: string;
  /** Which chart colour token to use (1-6). Default 1 (emerald). */
  colorIndex?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Fill the area under the line with a soft wash. Default true. */
  area?: boolean;
  className?: string;
}

/**
 * A minimal, dependency-free line chart drawn as an SVG polyline, for trends
 * (cost over time, runs per hour). The stroke uses a chart colour token and the
 * area under it a soft wash. The SVG is hidden from assistive tech; a visually
 * hidden table (caption = title) carries the data points. Pair it with a nearby
 * StatTile or caption so the trend is legible without reading the curve.
 */
export function LineChart({
  data,
  height = 160,
  width = 480,
  title,
  colorIndex = 1,
  area = true,
  className,
}: LineChartProps) {
  const pad = 6;
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const span = max - min || 1;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? pad : pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (d.value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M ${points[0][0]},${height - pad} L ${line
          .split(' ')
          .join(' L ')} L ${points[points.length - 1][0]},${height - pad} Z`
      : '';
  const stroke = `var(--chart-${colorIndex})`;

  return (
    <figure className={clsx('upmo-linechart', className)} role="group" aria-label={title ?? 'Line chart'}>
      <svg
        className="upmo-linechart__svg"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {area && areaPath ? (
          <path d={areaPath} fill={stroke} fillOpacity={0.12} stroke="none" />
        ) : null}
        <polyline points={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <ChartTable title={title ?? 'Line chart'} rows={data} />
    </figure>
  );
}
