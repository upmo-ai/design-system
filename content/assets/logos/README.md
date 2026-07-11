# Logos

These files are the Upmo wordmark, the app icon, the Open Graph card and the square lockups, as outlined SVG that needs no font. The wordmark is set in Familjen Grotesk 700 with -0.03em tracking (letter spacing). "up" is `emerald`, "mo" is `ink`, and the caret sits over the o.

- `upmo-wordmark-light.svg`: on `surface-000` and `surface-100` in the light theme.
- `upmo-wordmark-dark.svg`: for dark grounds. "up" and the caret use the dark `emerald` (#2f9a68). "mo" is Bone.
- `upmo-wordmark-ink.svg`: a single-ink wordmark in Ink with the green caret, for print and documents.
- `upmo-wordmark-bone.svg`: a single-ink wordmark in Bone with the green caret, for the inverse hero band and dark print.
- `upmo-app-icon.svg`: the tile for the app icon and favicon. It is an `emerald` square with `radius-lg` corners and a Bone caret. Export it at 16, 32, 180, 192 and 512.
- `upmo-app-icon-maskable.svg`: the same tile with square corners. The caret sits inside the 80% safe zone. Use it for the PWA manifest `purpose: maskable`.
- `upmo-og-light.svg`, `upmo-og-dark.svg`: the 1200×630 Open Graph card, the image shown when someone shares a link. The wordmark and tagline are outlines. Exports holds the PNG renders.
- `upmo-square-light.svg`: the square lockup for light grounds, in the colours of `upmo-wordmark-light.svg`. The caret sits large on top and the wordmark is centred below it, on a transparent 512×512 canvas. The clear space on every side equals the height of the large caret. Use it for social avatars, square tiles, app store listings and slide covers.
- `upmo-square-dark.svg`: the square lockup for dark grounds, in the colours of `upmo-wordmark-dark.svg`.
- `upmo-square-ink.svg`: the single-ink Ink square lockup with green carets, for print and documents.
- `upmo-square-bone.svg`: the single-ink Bone square lockup with green carets, for the inverse hero band and dark print.
- `upmo-square-tile.svg`: the square lockup on an `emerald` tile with the corners of the app icon, for places that need a filled square. Every part is Bone here, because a green caret disappears on the tile.

The minimum wordmark width is 72px. The minimum square lockup size is 128px, which keeps the wordmark inside it at its own 72px minimum. Below 128px use the caret mark alone. Clear space equals the caret height on all sides. Never recolour, outline, shadow or rotate a logo. Never type the wordmark in live text.
