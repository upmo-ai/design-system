Upmo runs always-on AI agents that carry out tasks for you. They run on Upmo's managed cloud at `upmo.ai`, or on infrastructure you own with the open-source release from `upmo.dev`. The interface should feel the way the agents work: calm and steady, and always honest about what is happening. This book holds the rules that give every Upmo screen that feel. It is public, so people outside Upmo can build on it too. Every component, page and marketing surface follows it. Every value it names lives in `tokens.json`. Tokens are named design values, such as colours and spacing.

The base library is **Mantine 9**, an open-source React component library. Upmo components are Mantine components styled with these tokens. We extend Mantine only where Upmo needs something it does not have: the caret and task status. The Mantine section shows how the theme object maps. Icons come from **Tabler Icons**, the set Mantine is built to work with.

## Principles

Accessibility and responsive behaviour govern the rest. A tighter layout never shrinks a touch target below its rule, removes a focus ring, or changes the words or the order of a phone layout.

1. **Readable before pretty.** The smallest text is 12px. Body text is 15px, with a line height of at least 1.4. Text meets 4.5:1 contrast on the ground (the surface behind it) that its token note names, in both themes. Colour alone never carries meaning. Everything clickable is reachable from the keyboard, and a touch target is 40px. The page still works at 200% zoom.
2. **Works on every width.** Design for the phone first. Use the same component and the same words at 360px and at 1440px. Only placement changes. The sidebar is a drawer, then a rail, then the full width. Content pads `space-4` below `bp-md` and `space-5` from `bp-md`.
3. **Up is the only metaphor.** The caret is the mark. It is also the loader, the progress indicator and the "done" sign. Nothing else points, spins, bounces or sparkles. No arrows, no suns, no leaves, no mascots. Never rotate the mark. Where the interface needs a plain "down" (menus, selects, the output token count), use a Tabler chevron, not the caret.
4. **React at once.** Every click, tap, keypress and hover gets an answer within one frame. A control shows its new state before the server replies. Then it confirms or reverts. Nothing is ever silent. When an agent works out of sight, people need to see that their action landed.
5. **Minimal means fewer things, placed exactly.** Use one accent hue, one neutral family and one radius scale. Borders give structure. Shadows are only for floating layers.

## Content

- **Voice.** Write plainly and directly, to "you". Keep sentences short. "Your data. Your control." is the model. Say what happens: the button reads "Start task", and the toast reads "Task started".
- **Name.** In prose, write `Upmo` with a capital U and no caret. The domains are lowercase. `upmo.ai` is the product and the managed service. `upmo.dev` is the open-source, self-hosted release. The wordmark is the SVG in `assets/logos`. Never type it.
- **Tagline.** "Always up." has a period and no hyphen. "Always-on" takes a hyphen only before a noun: "always-on agents", but "the agents are always on".
- **Casing.** Use sentence case everywhere: titles, buttons, labels, menu items, tabs. In sentence case, only the first word and names start with a capital. Use uppercase only in `overline` group headers.
- **Numbers.** Use tabular figures (`font-variant-numeric: tabular-nums`) wherever digits line up. Tabular figures give every digit the same width. Write durations as "4.2 s". For tokens in and out, put the caret-up glyph before the input count and the caret-down glyph before the output count: "^12k ˅1.2k tok", exact on hover. Write money with the currency symbol: "€0.011". No directional arrows anywhere.
- **Errors.** Say what went wrong and what to do next: "Provider key rejected. Check the key in Settings and try again." No apologies, no "Oops". When a task fails, the person needs the next step, not an apology.
- **Status words.** Every status shows a word or an icon as well as its colour: "Working", "Needs approval", "Done", "Failed".
- **Punctuation.** No em dashes anywhere. Use a comma, a colon or a new sentence. No emoji in UI text.
- **Familiar words.** Use the words people already know from mainstream apps: task, chat, run, usage, notifications, folder. One concept has one word everywhere, in the interface, the docs, the API and the code. The Glossary lists them.
- **Agents and tasks.** A task is work an agent does for you. Its status moves through Preparing, Planning, Working and Checking, then Done or Failed. Use those words. Never call them "stages" or "phases" in the interface. A step is a stepper step in a form, or a step in a task's plan.

## Colour

There are two themes, and light comes first. Light sits on Bone (`surface-000`). Dark sits on Ink. Each token holds both values. Components read tokens only, never a literal colour value.

- **Grounds.** `surface-000` is the page. `surface-100` is anything raised: cards, inputs, modals, menus. `surface-200` is anything sunken: sidebar, code, table headers. Use `surface-hover` for hover and `surface-selected` for the selected item.
- **Text.** Use `ink` for headings and labels, `ink-secondary` for prose and `ink-muted` for metadata and placeholders. Use `ink-disabled` only on disabled controls. On `surface-inverse`, use `ink-inverse`.
- **The green.** `emerald` is the brand colour. Use it for the caret, the "up", status icons and text at 24px and above. It is only 3.9:1 on Bone, so green text at body size and links use `emerald-deep`. Primary buttons fill with `emerald-deep` and use `ink-on-brand` text. Hover is `emerald-hover`. Pressed is `emerald-active`. `emerald-soft` is the tinted ground for light buttons, success alerts and the done badge.
- **Borders.** `border` is decorative: cards, dividers, table rules. `border-strong` is any edge that defines a control: inputs, checkboxes, radios, outline buttons. The difference is contrast. Control edges meet 3:1. Decoration does not have to.
- **Status.** `success` (green), `warning` (amber), `danger` (clay red) and `info` (blue) each have a `-soft` ground. Success and danger have almost the same lightness. So each status also carries its word or icon: the done caret, the warning clock, the failed X, the info circle. Never a lone coloured dot.
- **Focus.** Every focusable element gets the `focus` ring: 2px solid, 2px offset, in both themes. Nothing else draws a ring.
- **Dark theme.** Dark is not the light theme inverted. Greens get lighter: `emerald-deep` becomes a 6.5:1 mint on Ink and takes Ink text. Surfaces get lighter as they rise. Shadows get deeper. Set `data-theme="dark"` on the root. Mantine reads `data-mantine-color-scheme="dark"`.

## Typography

- **UI face: Manrope** (`ui`), weights 400 to 700. Load it from Google Fonts or bundle it as a variable font. `body` (15/22) is the default. Use `body-sm` for metadata, `label` for form labels and small buttons, `caption` for hints and `overline` for uppercase group headers. Headings run from `h1` to `h4`, with one `h1` per page.
- **Display face: Familjen Grotesk** (`display`), weight 700 only. It is for the wordmark (shipped as SVG, never typed) and for the marketing styles `hero` and `hero-sm`. It never appears inside the app.
- **Code face: Fira Code** (`mono`), in `code` and `code-sm`. Use it for code blocks, tool call arguments, versions and keyboard shortcuts. Ligatures are on.
- **Measure.** Measure is the length of a line of text. Running text stays at or under `measure` (68ch). Chat replies, descriptions and docs wrap there.
- **Weights.** 400 for text. 500 for captions. 600 for labels, h1 to h4 and button text. 700 for display. Never 300 or 800.
- **Minimum size.** 12px (`caption`, `code-sm`). Nothing smaller.

## Spacing and layout

- **Scale.** Spacing runs from `space-1` (4px) to `space-16` (64px). Inside a component, use `space-2` and `space-3`. Cards pad `space-4` and sit `space-4` apart. The gap under a page title is `space-4`; sections sit `space-6` apart.
- **App shell.** The shell is the frame around every page. From `bp-md`, the sidebar is `sidebar` (248px) on `surface-200`. From `bp-sm`, it is a 56px icon rail. Below `bp-sm`, it is a drawer. The sidebar pads `space-3`, with `space-1` between items. The top bar is `topbar` (48px). Content pads `space-4` below `bp-md` and `space-5` from `bp-md`. It stops growing at `bp-xl`.
- **Grids.** Cards use `auto-fill, minmax(320px, 1fr)` with `space-4` gaps, so the number of columns follows the width. Form rows go two across from `bp-xs`.
- **Side gutter.** Never less than `space-4`. The page never scrolls sideways. Wide tables and code scroll inside their own container.
- **Alignment.** Use flex and grid with `gap`, not margins. Repeated items share edges, baselines and inner padding.

## Radius, borders, shadows

- **Radius.** `radius-md` (8px) on controls. `radius-lg` (12px) on containers. `radius-xl` (16px) on overlays and the composer. `radius-full` on badges, avatars and switches. `radius-xs` on checkboxes, kbd and inline code.
- **Borders.** All borders are 1px. Use `border` for structure and `border-strong` for controls. A selected outline (tiles, chips) is `emerald-deep` at 1px. Invalid fields use `danger`.
- **Shadows.** `shadow-sm` on menus and tooltips. `shadow-md` on notifications and the focused composer. `shadow-lg` on modals. Cards at rest have a border and no shadow.

## Motion

- **Durations.** 120ms for hover and colour changes. 200ms for state changes (checked, expanded, caret stroke). 240ms for overlays entering, 160ms for leaving. Easing is `cubic-bezier(.4, 0, .2, 1)`. Leaving uses `ease-in`.
- **Press.** Buttons and tiles scale to 0.98 while pressed, then return. With the fill change, this is the signal that the control reacted.
- **The caret.** Progress draws the left stroke, then the right stroke, 200ms each, in ink. Done turns the whole caret `emerald` in one 200ms fade. The loader draws itself in a 1.6s loop (`Loader`). Working tasks lift 2px every 4s, so you can see an agent is still busy. The caret never spins.
- **Loading.** Buttons show the draw caret in place of their icon and keep their width. Lists show `Skeleton` shimmer. Nothing shows a spinner.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`, every animation stops. Carets show their final state. Overlays only fade.

## Interaction states

Every interactive element has all of these states. Each one looks different from the others, in both themes:

- **Default** and **hover** (`surface-hover` or `emerald-hover`, 120ms).
- **Active / pressed** (`emerald-active` or a darker ground, scale 0.98, immediate).
- **Focus-visible** (the `focus` ring, 2px, 2px offset). Mouse clicks do not show it. Keyboard focus always does.
- **Disabled** (`ink-disabled` text, `surface-200` ground, no hover, `cursor: not-allowed`). It uses `aria-disabled`, so it stays in the tab order, with a tooltip that says why.
- **Loading** (the draw caret, `aria-busy`, width held, clicks ignored).
- **Selected / checked** (`surface-selected` ground or `emerald-deep` fill, plus the check mark or caret).
- **Invalid** (`danger` border, `danger` message with the X icon, `aria-invalid`, `aria-describedby` pointing to the message).

## Iconography

- **Tabler Icons**, outline style, 1.75 stroke. Use `icon-md` (20px) in controls, `icon-sm` (16px) inside badges, inputs and sidebar items, and `icon-lg` (24px) in empty states and tiles. Icons take `currentColor`. A decorative icon is `aria-hidden`. An icon-only control has an `aria-label`.
- **The caret** (`assets/icons/caret.svg`) replaces every arrow-up, chevron-up, trending-up and check in the set. "Send" is the caret. So are "Done" and "Scroll to top". Downward chevrons for menus and selects are fine. They are not the mark.
- **Status carets** (`assets/icons/status-*.svg`): idle is `caret-idle` (Queued). The left stroke in `ink` and the right in `caret-idle` (`status-plan`) is Preparing and Planning. Both strokes in `ink` (`status-build`) are Working and Checking. Done is `emerald`. Failed is an X in `danger`. Each sits next to its word.
- **No emoji** in UI, no filled icons, no two-tone icons.

## Logo

- **Wordmark**: use `assets/logos/upmo-wordmark-light.svg` on light grounds and `-dark.svg` on dark. Use `-ink.svg` and `-bone.svg` for single-ink print. The minimum width is 72px. Keep clear space on every side equal to the caret height.
- **Mark**: `assets/icons/caret.svg` alone is the icon, the favicon and the app icon (`assets/logos/upmo-app-icon.svg`, an `emerald` tile with a Bone caret). The minimum size is 16px.
- Never colour the caret anything but `emerald`, `ink`, `caret-idle` or Bone. Never add a drop shadow, outline, gradient or rotation. Never set the wordmark in live text.

## Other sections

The other sections go deeper:

- **Accessibility**: the checklist every component passes.
- **Forms**: interactive validation, steps, long forms.
- **Patterns**: navigation, overlays, feedback, empty and loading states.
- **Mantine**: the theme object and the component mapping.
- **Data visualisation**: chart forms and validated palettes.
- **Microcopy**: every string, with `microcopy.json` as the source.
- **Icons**: the concept map, `icons.json`.
- **High contrast and colour vision**: the `hc` theme, forced colours, the simulation report.
- **Responsive**: breakpoints, shell, overlays, touch.
- **Motion**: the tokens and the catalogue.
- **Marketing kit**: site register, words, assets, templates.

The Foundations group holds review tools, not product components: IconMap, ColorVision, Breakpoints, Motion. Exports holds PNG and ICO versions of the logo, for places that cannot use SVG.
