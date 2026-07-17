# Chart

Stat tiles, lines and bars for the Usage page and cost panels, drawn with the validated chart tokens.

The Data visualisation section holds the rules. This card shows them in use.

## When to use

- A number that matters now: a stat tile. Sizes by category: horizontal bars in `chart-1`. Change over time: a line. Parts over time: stacked bars. Never a pie or a dual axis.

## What the consumer provides

- `title` and a unit subtitle ("€ · last 14 days"). The series in a fixed order, with names, and the data. A "Table" toggle that shows the same rows as a `Table`.
- Deltas on stat tiles carry the caret (up, `success`) or the X (`danger`), plus the words. Never a lone arrow.

## Behaviour

- The container is `surface-100` with `border` and `radius-lg`. Gridlines are `border` and the baseline is `border-strong`. Labels are `caption` in `ink-muted`. Values are `ink` at weight 600, in tabular figures.
- Lines are 2px. End markers are 8px with a `surface-100` ring. The last point gets a direct label. One series may have a 12% area fill under it.
- Bars have 4px rounded ends away from the baseline and a 2px gap between them.
- Hover shows a crosshair and a `surface-inverse` tooltip with every series' value. The hit area is the whole column. Charts draw in over 200ms, which is off under reduced motion.
- Two or more series get a legend. One series gets none. Series keep their colour when filters change.

## Tokens

`chart-1` to `chart-6`, `chart-ord-1` to `chart-ord-5`, `chart-mid`, `surface-100`, `border`, `border-strong`, `ink`, `ink-muted`, `surface-inverse`, `ink-inverse`, `success`, `danger`, `radius-lg`.

## Mantine

`@mantine/charts` (Recharts 3): `<LineChart series={[{ name: 'OpenAI', color: 'chart-1' }]} curveType="linear" strokeWidth={2} withDots={false} tooltipProps />`, `<BarChart orientation="vertical" />`. Register the chart tokens as theme colours so `color="chart-1"` resolves. ECharts in the current app maps the same tokens through its theme object.
