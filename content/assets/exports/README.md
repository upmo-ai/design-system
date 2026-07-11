# Exports

Raster renders of the logo, for places that cannot take SVG. Every file is generated from the SVG in Logos. Never edit a PNG by hand. Render it again.

- `upmo-icon-16.png`, `-32`, `-48`: favicon sizes. Combine them into `favicon.ico` (16, 32, 48) for older browsers. Where a browser supports it, serve `assets/icons/caret.svg` as the SVG favicon.
- `upmo-icon-180.png`: the Apple touch icon. `upmo-icon-192.png`, `-512.png`: PWA manifest `any`. `upmo-icon-maskable-512.png`: manifest `purpose: maskable` (a square tile with the caret inside the safe zone).
- `upmo-avatar-400.png`: social avatars (GitHub organisation, X, LinkedIn, Discord).
- `upmo-og-light.png`, `upmo-og-dark.png`: the 1200×630 Open Graph and Twitter cards.
- `upmo-wordmark-light-1024.png`, `-dark-1024.png`: the wordmark at 2×, for slide decks, email and partner pages that do not accept SVG.
- `upmo-square-light-1024.png`, `upmo-square-dark-1024.png`: the square lockups at 1024×1024 on a transparent ground. Use them for social avatars, app store listings and slide covers that do not accept SVG.
- `upmo-square-tile-1024.png`: the `emerald` square tile at 1024×1024, for places that need a filled square. Its rounded corners are transparent.

To render a file, run this in Docker from the system root: `rsvg-convert -w SIZE -h SIZE assets/logos/upmo-app-icon.svg -o upmo-icon-SIZE.png`.
