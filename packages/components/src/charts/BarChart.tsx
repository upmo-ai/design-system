import clsx from 'clsx';

export interface BarDatum {
  label: string;
  value: number;
  /** Optional pre-formatted value for the tooltip/caption. Defaults to value. */
  display?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  /** Chart height in px. Default 160. */
  height?: number;
  /** Accessible title for the chart. */
  title?: string;
  /** Which chart colour token to use (1-6). Default 1 (emerald). */
  colorIndex?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * A minimal, dependency-free vertical bar chart drawn with CSS, for usage
 * surfaces (runs per day, tokens per model). Colours come from the chart tokens,
 * which pass colour-vision checks in every theme. It carries an accessible
 * title and each bar is labelled, so the data is legible without the visual.
 */
export function BarChart({ data, height = 160, title, colorIndex = 1, className }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <figure
      className={clsx('upmo-barchart', className)}
      role="group"
      aria-label={title ?? 'Bar chart'}
    >
      <div className="upmo-barchart__plot" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="upmo-barchart__col">
              <div className="upmo-barchart__bar-wrap">
                <div
                  className="upmo-barchart__bar"
                  style={{
                    height: `${pct}%`,
                    background: `var(--chart-${colorIndex})`,
                  }}
                  title={`${d.label}: ${d.display ?? d.value}`}
                >
                  <span className="upmo-barchart__value">{d.display ?? d.value}</span>
                </div>
              </div>
              <div className="upmo-barchart__label">{d.label}</div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
