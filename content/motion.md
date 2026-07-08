# Motion

Motion in Upmo has one job: it confirms that something reacted. It is short and the same everywhere. Only the caret may move on its own. The values are the `motion` tokens, and the Motion component replays each one.

## Tokens

| Token | Value | Used for |
| --- | --- | --- |
| `duration-fast` | 120ms | Hover, colour, border, press scale, tooltip fade |
| `duration-base` | 200ms | State changes: checked, expanded, selected, caret stroke, progress, chevron |
| `duration-enter` / `duration-leave` | 240ms / 160ms | Overlays in and out. Leaving is always shorter |
| `duration-loader` | 1600ms | One loop of the loader caret |
| `duration-lift` | 4000ms | Period of the working-task lift |
| `duration-shimmer` | 1800ms | One skeleton shimmer pass |
| `ease-standard` | `cubic-bezier(.4, 0, .2, 1)` | Everything |
| `ease-leave` | `cubic-bezier(.4, 0, 1, 1)` | Overlays leaving |
| `ease-caret` | `cubic-bezier(.2, 0, 0, 1)` | The caret draw |
| `press-scale` | 0.98 | Buttons and tiles while pressed |
| `tooltip-delay` | 400ms | Hover time before a tooltip. 0 if another tooltip closed within 1s |

## The catalogue

Each entry names the trigger, what moves and for how long. Nothing else animates.

1. **Press.** Pointer down on a button, tile, chip or nav item scales it to `press-scale`. The ground darkens one step. Both take `duration-fast`. Pointer up returns at `duration-fast`. This is the "it reacted" signal, and it runs even when the action is instant. Keyboard activation plays it once. The one exception is the 20px checkbox and radio box. It scales to 0.92, so the press stays visible at that size.
2. **Hover.** Ground and border colour change at `duration-fast`. Hover never lifts, scales or grows a shadow.
3. **Check and radio.** The box fills at `duration-fast`. The check mark scales from 0.6 to 1 and fades in over 160ms with `ease-standard`. Unchecking is a fade only.
4. **Switch.** The knob slides 16px and the track changes colour, both at `duration-base`. While pressed, the knob widens by 4px.
5. **Caret draw (progress).** The left stroke draws, then the right stroke, at `duration-base` each, with `ease-caret`, in ink. Stepper, Progress and StatusCaret use it as a task advances.
6. **Done.** The whole caret fades from ink to `emerald` in one `duration-base`. No bounce, no scale.
7. **Loader.** The caret draws itself in `duration-loader` loops: draw 45%, hold 25%, fade 15%, reset 15%. It replaces every spinner, including inside buttons. There it takes the icon's place, and the button keeps its width.
8. **Lift.** A working task's caret rises 14% of its height and comes back down. It rises over the first 40% of each `duration-lift` cycle, holds at the top until 60%, then settles back. It is the only ambient motion in the product, meaning motion that runs while nobody touches anything. Use one per tile, never on a list of 50. Lists show the static full caret. One glance tells a person that an agent is still working.
9. **Skeleton shimmer.** A gradient sweeps from `surface-200` to `surface-hover` every `duration-shimmer`. It shows after 300ms of waiting, never before, so fast responses never flash.
10. **Expand and collapse.** Accordion, Spoiler and side panels animate their height at `duration-base` with `ease-standard`. The chevron rotates 180° in the same time. Content inside does not fade on its own.
11. **Overlays in.** Modal and command palette fade in and scale from 0.98 to 1. Drawer slides in from its edge. Menu, Popover and Tooltip fade in with a 4px slide from the anchor. Toast slides up 8px and fades in. All use `duration-enter`, and the scrim fades in at the same time.
12. **Overlays out.** The reverse, at `duration-leave` with `ease-leave`. A toast that someone dismisses by hand leaves at once.
13. **Progress bar.** Width changes at `duration-base`. An indeterminate bar (one with no known end) is a 30% segment that sweeps across in 1.2s.
14. **Streaming text.** Tokens appear as they arrive, with no fade. The caret loader sits at the end of the text until the first token comes, then disappears. While streaming, the composer border changes to `emerald-deep` at `duration-fast`.
15. **Scroll to top.** Smooth scroll, at most 400ms whatever the distance. Then the caret button fades out.
16. **Page changes.** None. Routes swap at once. If the new page's data is late, its skeleton appears.
17. **Step change.** In a `Stepper`, the old step fades out and moves 8px back in `duration-leave`. The new step fades in from 8px ahead in `duration-enter`. Going forward, it comes from the right. Going back, it comes from the left. Both use `ease-standard`. The form height follows in `duration-enter`, so the buttons below do not jump. Under reduced motion, both steps only fade, in `duration-fast`.

## Rules

- **No motion for decoration.** Nothing moves on page load, on scroll or on idle. The one exception is the lift on a working task.
- **Never block.** Nothing waits for an animation to end before it accepts the next input. A press during an overlay's enter cancels the enter.
- **Transform and opacity only**, plus colour. Never animate width, height, top or left. The exceptions are the expand pattern, the step change height and the progress bar, because they are bounded and short.
- **One thing at a time.** A control changes its ground, border and text colour together, in one duration. Two different durations on the same element is a bug.
- **Reduced motion.** This applies under `prefers-reduced-motion: reduce` or the Appearance setting. Every duration becomes 0. The caret renders in its final state. Overlays fade at `duration-fast`, with no slide or scale. The loader becomes a static caret with `aria-busy`. Lift and shimmer stop, and skeletons stay as flat blocks. The Motion component has a toggle to show this.

## Mantine

`createTheme({ ... })` sets no global transition. Each component's `transitionDuration` and `transitionTimingFunction` come from these tokens. Modal, Drawer, Menu, Popover and Tooltip use Mantine `transitionProps` (`fade`, `slide-left`, `pop`). Their `duration` comes from `duration-enter` and their `exitDuration` from `duration-leave`. The caret draw and lift are CSS keyframes in the Upmo stylesheet. No animation anywhere runs in JavaScript.
