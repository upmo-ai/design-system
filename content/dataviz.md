# Data visualisation

Charts appear on the Usage page, in task cost panels and in reports. People use them to see what their agents do and what that costs, so a chart must be easy to read correctly. Chart colour is computed, not chosen. Every palette below went through a colour-vision validator against both surfaces. The numbers are in the token notes.

## Pick the form first

| The data's job | Form |
| --- | --- |
| One number that matters now (spend this month, tasks working) | Stat tile: the value in `h1`, label in `body-sm`, a delta with the caret or an X, optional sparkline |
| Compare magnitudes across categories (tokens per model) | Horizontal bars, one series in `chart-1`, sorted, direct labels |
| Change over time (daily cost, runs per day) | Line, 2px, markers only at the ends and on hover. Area fill at 12% under a single series |
| Parts of a whole over time (cost by provider per week) | Stacked bars with a 2px `surface-100` gap between segments. Never a pie |
| Distribution across two dimensions (model × hour) | Heatmap on the ordinal ramp, values on hover, legend with the ramp |
| Above or below a baseline (budget variance) | Diverging bars: `chart-1` above, `chart-6` below, `chart-mid` at zero |

Never use a dual-axis chart, with two value scales on one chart. Two measures of different scale get two charts or an indexed line. Never use a pie or donut. A stacked bar or a table says it better.

## Colour by job

- **Categorical** (which series): use `chart-1` to `chart-6` in that order. Never start the cycle again. Bars, lines and stacks take up to six series. Scatter plots, maps and small multiples use only the first three. Fold the rest into "Other".
- **Nominal bars** (products, models, agents): every bar takes `chart-1`. Bar length carries the value. Colour does not repeat it.
- **Ordinal and sequential** (tiers, buckets, heatmaps): use the emerald ramp, `chart-ord-1` to `chart-ord-4` (light) or `-5` (dark). Light means low.
- **Diverging** (variance, delta): `chart-1` ↔ `chart-6`, with `chart-mid` at the centre and equal steps on each side.
- **Status** (healthy, rate limited, offline): `success`, `warning`, `danger`. Always show them with the icon and word. Never use them as a series colour. When a series means good or bad (error rate), it uses status tokens. When it is just "series 4", it uses categorical colours. Never both in one chart.
- Text in charts uses `ink` or `ink-muted`, never the series colour. The coloured mark beside the label shows which series it is.

## Marks

- Bars in the same group sit 2px apart. Their ends away from the baseline have 4px rounded corners. The baseline is `border-strong` and gridlines are `border`. No vertical gridlines.
- Lines are 2px with round caps. Markers are 8px with a 2px `surface-100` ring. Area fills are 12% opacity, under one series only.
- Put direct labels on the last point of each line and on the top three bars. Show the rest on hover. Add a legend for two or more series. One series needs no legend, because the title names it.
- Axis labels use `caption` in `ink-muted`, with tabular numbers and at most six ticks. Units go in the axis title, not on every tick ("€", "tokens, k").
- Empty values are gaps, not zeros. An unknown cost reads "unknown" in the tooltip, never a guessed bar. Upmo never guesses what a run cost.

## Interaction

- Every chart reacts to hover. Lines show a crosshair and a tooltip. Bars show a tooltip per bar. Heatmaps show a tooltip per cell. The tooltip is `surface-inverse` with `ink-inverse` text in `caption`. It shows the series mark, name and value.
- Hit targets are larger than the mark. For a point on a line, the whole column is the target.
- Filters sit in one row above the charts. There is a date-range `Select` with presets (Today, 7 days, 30 days, Month to date, Custom), plus dimension `Select`s. Changing a filter keeps each series' colour. Colour follows the thing it stands for, not its rank.
- Every chart has a "Table" toggle that shows the same data as a `Table`. Reduced motion turns off the 200ms draw-in.

## Dark theme

The dark values are their own steps, checked against Ink. They are not an inversion. Lines and bars get lighter. The ramp flips its anchor, so light still means low on a dark ground.

## Validation record

Categorical, light: worst adjacent CVD (colour vision deficiency) ΔE 12.6, normal ΔE 18.3, all ≥ 3:1 on Bone. Dark: CVD 10.5, normal 15.9, all ≥ 3:1 on Ink. The first three slots pass the all-pairs check in both themes (CVD 6.6 light / 7.8 dark). That is in the floor band, so direct labels are required there. The ordinal ramps pass the monotone, step and light-end checks in both themes. Run the validator again whenever a chart token changes.
