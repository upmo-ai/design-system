# Motion

The motion catalogue, live, with one replayable tile for every motion in the system.

The tiles are press, check and switch, caret draw, done fade, loader loop, lift, shimmer, expand, modal in and out, toast, and determinate and indeterminate progress. Each tile names its duration. The Reduced motion switch shows what `prefers-reduced-motion` does.

- The values come from the `motion` tokens. The Motion section lists every entry and the rules.
- The loader and the lift are the only motions that run without a trigger. The lift runs only on a working task.
- This is a review tool, not a product component. Product code uses the keyframes in the shared stylesheet and Mantine `transitionProps`.
