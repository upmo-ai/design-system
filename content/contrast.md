# High contrast and colour vision

This section is for people who need more contrast than AA gives, and for people who see colour differently. The light and dark themes do not cover them on their own. So the system adds a third theme. It also reports what a colour-vision simulator says about every colour the system relies on.

## High contrast theme (`hc`)

Every colour token has a third value for this theme. It is based on the light theme and built for **WCAG AAA**, the strictest level: text 7:1, controls and icons 4.5:1, decorative borders 3:1. It is not "the light theme, darker". Surfaces collapse to white and a single grey, so edges come from borders, not from tone. The green becomes a 10:1 forest green. Status colours move to 10:1, and their soft grounds stay at 8:1 or better.

| Token | hc | Why |
| --- | --- | --- |
| `surface-000`, `surface-100` | `#ffffff` | One white ground. Raised means bordered, not lighter |
| `surface-200` | `#ededed` | Sunken areas, 17.9:1 with ink |
| `surface-hover`, `surface-selected` | `#e2e2e2`, `#d6efe2` | Hover and selection stay visible at 16:1 and 17:1 |
| `ink`, `ink-secondary` | `#000000` | 21:1 |
| `ink-muted`, `ink-disabled` | `#2f3532`, `#545a57` | 12.5:1 and 6:1 on `surface-200` |
| `emerald`, `emerald-deep` | `#0d593a`, `#0a4a30` | 8.4:1 and 10.3:1 on white, so green text works at any size |
| `emerald-hover`, `emerald-active` | `#083d27`, `#062d1d` | White text on them is 12.3:1 and 15:1 |
| `border` / `border-strong` / `focus` | `#6e6e6e` / `#000000` / `#000000` | 5.1:1 decorative, 21:1 for control edges and the ring |
| `warning`, `danger`, `info` | `#5c3a00`, `#7d1d0e`, `#173f6e` | 10.2:1, 10.2:1, 10.7:1 on white. 9.1, 8.4, 8.6 on their soft grounds |
| `mist` | `#5e6662` | The idle caret at 5.9:1 |
| `chart-1..6` | `#0a4a30 #1a4fa8 #7a4d00 #a52a6b #4b2fa6 #8f3414` | All 6.7:1 or better on white |
| `overlay` | `#000000cc` | |

Audit: we checked 34 text and edge pairs, and all are at or above AAA. The full list is in the token notes, and the audit script prints it.

**When it is on.** People choose it in Settings → Appearance → Contrast: Default / High. Default also follows `prefers-contrast: more`. The theme sets `data-theme="hc"`. Mantine reads it as the light scheme with the hc CSS variables. In this theme:

- Every control has a visible 1px black edge. That includes subtle and ghost buttons, which otherwise have no edge.
- Focus is a 3px black ring with a 1px white inner gap, so it reads on any ground.
- Menus, popovers and modals get a 1px `border-strong` edge in place of a shadow.
- Skeleton shimmer is off. So are the 12% area fills in charts. Charts draw outlines.
- Link text is underlined at rest.
- The dark `emerald` and placeholders are never used. `ink-muted` is the lightest text.

**Forced colours.** Under Windows High Contrast (`forced-colors: active`), the browser repaints the page with system colours. The system does not fight it. `forced-color-adjust: auto` applies everywhere except the caret and status icons. Those keep `currentColor`, so they take `CanvasText`. Selected states add a 2px `Highlight` outline, because the browser removes background colour. Disabled controls use `GrayText`. The focus ring uses `Highlight`. Nothing relies on a tinted ground.

## Colour vision report

Method: we used the chart validator from the Data visualisation section. It simulates protan, deutan and tritan vision, the three main kinds of colour vision deficiency (CVD), plus normal vision. It checks all pairs against each theme's ground. Numbers are ΔE in OKLab ×100, a measure of how different two colours look. 8 is comfortable. 6 to 8 needs a second cue. Under 6, colour alone cannot tell the two apart.

**Status colours.** `success`, `warning`, `danger` and `info`, as a set:

| Theme | Worst CVD pair | ΔE | Worst normal pair | ΔE |
| --- | --- | --- | --- | --- |
| Light | danger ↔ warning (deutan) | 3.3 | danger ↔ warning | 8.7 |
| Dark | danger ↔ success (protan) | 1.7 | danger ↔ warning | 11.2 |
| High contrast | danger ↔ warning (deutan) | 1.6 | danger ↔ warning | 9.0 |

Verdict: **status colour is not a signal on its own in any theme**. Under protan vision on dark, failed and done are the same colour. This finding is behind a rule in the Colour and Microcopy sections: every status carries its word and its icon. That means the done caret, the failed X, the clock, and never a lone dot. Nobody should mistake a failed task for a finished one. Red and amber at equal lightness are hard to tell apart, and that comes from the hues themselves. A palette that separated them would lose the 4.5:1 text contrast. So the system keeps the palette and keeps the rule. The shapes differ too: the done caret and the failed X, a clock for warning, a circle for info. Shape separates what hue cannot.

**Categorical chart palette.** Light: worst adjacent CVD ΔE 12.6, normal 18.3. Dark: 10.5 and 15.9. Use six slots in bars and lines, and three in scatter plots and maps. High contrast: CVD 10.9, normal 18.2. Its lightness sits below the validator's band on purpose, because contrast comes first. Every hc chart draws direct labels and shows the Table toggle by default.

**The brand green vs grey.** With achromatopsia (seeing no colour at all), the emerald caret looks mid grey. The caret is still the mark, because its shape is the mark. Green alone never means "on", "active" or "selected". The active nav item is also bold and has the indicator bar. A selected tile also has the check in the corner. A checked switch also moves its knob.

**Checked, not assumed.** The ColorVision component applies the same simulation matrices live to the status row, the chart swatches and a card, in all three themes. A reviewer can look for themselves instead of trusting the numbers.
