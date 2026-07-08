# Marketing kit

The product and the marketing site are one brand with two registers: the app speaks quietly, and the site may speak louder. Upmo has two homes: `upmo.ai` for the managed service, and `upmo.dev` for the open-source release you host yourself. The site uses the same four ingredients as the app: Bone and Ink, one green, the caret, and Familjen Grotesk for display. No photos of people, no stock illustration, no gradients, no glow.

## Ingredients

- **Grounds.** Bone (`surface-000` light) for the page. Ink for inverse bands. Grounds run full-bleed, edge to edge, with no textures. Use at most one inverse band per page.
- **Type.** Headlines use Familjen Grotesk 700, in `hero` (56/60, -0.02em) and `hero-sm` (40/44). They are sentence case, never all caps. Everything else is Manrope, as in the app: `body-lg` for lead paragraphs, `body` for text, `overline` for eyebrow labels. Code is Fira Code.
- **Colour.** Green is an accent: the caret, the "up", a link, the primary button, and at most one highlighted word in a headline. Never put a green ground behind text. The one exception is the inverse hero card. It uses `emerald-deep` with Bone text and the Bone wordmark.
- **The caret.** It is the only decorative element. It may be large, up to a quarter of the viewport. It is outlined (stroke 10/64, scaled) and always `emerald`, `ink`, `mist` or Bone. Never fill it, rotate it or repeat it as a pattern. One per view.
- **Screenshots.** Show the real product, in the light theme by default, with a 1px `border` and `radius-lg`. No device frames, no drop shadows, no angled perspective. Dark theme screenshots go on the inverse band only. Content in screenshots is realistic. It never says "Lorem" or shows fake customers.
- **Motion.** The landing loader is the only animation on the site. The caret draws once on load, then nothing moves. Pages scroll down. The earlier idea of a landing page that scrolls up is retired (see Patterns).

## Words

- **Name**: Upmo. The tagline is **Always up.** and it keeps its period. The elevator line, our one-line pitch, is "Always-on AI agents. On our cloud or on infrastructure you own."
- **Two sites, one brand.** `upmo.ai` is the product site and the managed service, for people and teams who pay to have it run. `upmo.dev` is the open-source release, for people who run it themselves. Both use the same wordmark, tokens, components and microcopy. Only the hero copy, the proof row and the first call to action differ. Neither site hides the other. upmo.ai links "Self-host it" to upmo.dev. upmo.dev links "Or let us run it" to upmo.ai.
- **Claims** are things the product does on both: "Runs tasks while you sleep", "Your keys stay yours", "Every cost shown, never guessed", "Asks before anything you would want to approve". Self-hosted only: "Your data stays on your server". Managed only: "Nothing to install". No superlatives, no "revolutionary", no "powered by AI".
- **Audience voice**: second person, plain. On upmo.dev, use the exact noun: "Docker Compose, one Postgres", "AGPL", "Helm chart". On upmo.ai, describe the outcome: "a goal in, a finished result out, every step shown". The same person may read both sites. The facts never contradict. Only the depth changes.
- **Calls to action**: on upmo.ai, "Start on Upmo Cloud", "See a task run", "Self-host it". On upmo.dev, "Install Upmo", "Read the docs", "See a task run". Never "Get started", "Learn more" or "Sign up free".
- The Microcopy voice rules apply: no em dashes, no exclamation marks, no emoji, sentence case.

## Layouts

**Hero.** It opens with an eyebrow, a short label above the headline (`overline`, `ink-muted`). Then the headline (`hero`, max 12 words, one green word at most) and a lead (`body-lg`, `ink-secondary`, 68ch). Then two buttons (`control-lg`, filled then outline). The caret sits large to the right, or above the text on phones. The Hero component is the reference.

**Feature rows.** Text and screenshot alternate sides, with `space-16` between rows. From `bp-md`, the screenshot is 60% wide. Below that, they stack. Each row has an `h2`, two sentences and one link.

**Stat band.** Three or four stat tiles on `surface-100`, with `h1` numbers in tabular figures and `body-sm` labels. Use real numbers only. "unknown" is better than a made-up one.

**Inverse band.** Ink ground, Bone text, the Bone wordmark, the green caret. Use it once, for the install call to action or the open-source statement.

**Footer.** Wordmark (light), tagline, columns of `body-sm` links, licence line.

## Assets

| Asset | File | Use |
| --- | --- | --- |
| Wordmark | `Logos/upmo-wordmark-light.svg`, `-dark.svg`, `-ink.svg`, `-bone.svg` | Site header, footer, partner pages. PNG at 2× in Exports for places that cannot take SVG. |
| App icon | `Logos/upmo-app-icon.svg`. PNG 16, 32, 180, 192, 512 and maskable 512 in Exports. `favicon.ico` | Favicon, PWA manifest, store listings |
| Social avatar | `Exports/upmo-avatar-400.png` | GitHub organisation, X, LinkedIn, Discord. The app icon tile. Never the wordmark in a circle. |
| Open Graph card | `Exports/upmo-og-light.png`, `-dark.png` (1200×630, from `Logos/upmo-og-light.svg`) | `og:image` and `twitter:image` on every page. The wordmark and tagline go on the image, not the page title. |
| Caret | `Icons/caret.svg` | Decorative, see above |

Clear space around the wordmark equals the caret height. Its minimum width is 72px on screen and 20mm in print. The caret alone goes no smaller than 16px.

## Templates

- **Slides**: Bone ground and Manrope. The title slide is in `hero-sm`. Every slide has the wordmark bottom left and the page number bottom right in `caption`. One idea per slide, one screenshot per slide. Use the dark variant only for the title and closing slides.
- **Email signature**: name, role, "Upmo · Always up.", `upmo.ai`, with the 16px caret before the domain. No images other than the caret, and no banners.
- **README badge**: the caret at 16px, "Built with Upmo" in `label`, Bone ground, 1px `border`, `radius-full`.
- **Documents and PDFs**: body in Manrope 11pt, headings in Familjen, the ink wordmark in the header. Green is only for links and the caret.

## Do not

- No green page grounds, gradients, glows, blurs or shadows behind the caret.
- No arrows, rockets, sparkles, robots or brains as imagery. The caret is the symbol for "up" and "done". Tabler outline icons carry everything else.
- No mascots and no cat. The origin story lives on the About page, as text.
- Never set the wordmark in live text. Never add "AI" to the name. Never put a caret on the "u".
