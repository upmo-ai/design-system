# Icons

Upmo uses one icon set, one stroke width and one mark. The set is **Tabler Icons 3**, outline style. Mantine's own components use it, and it has a glyph for every object Upmo names. The mark is the caret. It replaces every "up", "done", "send" and "check" glyph in the set. `icons.json` maps each concept to its icon name. Code imports icons by concept, never by picking a glyph on the spot.

## Rules

- **Stroke 1.75**, round caps and joins, `currentColor`. Never use the filled variants or two-tone icons. Never draw a custom icon for a concept Tabler covers.
- **Sizes.** `icon-sm` 16px inside badges, inputs and `body-sm` rows. `icon-md` 20px in buttons, nav and table actions. `icon-lg` 24px in empty states and tiles. Marketing can go to 32px and 48px. No other sizes.
- **One concept, one icon.** "Tasks" is `list-check` in the sidebar, in the command palette, on a task tile and in a breadcrumb. People learn an icon once and find it everywhere. The map is the source. If a concept needs an icon and is not in the map, add it to the map first.
- **The caret wins.** Wherever Tabler would give `chevron-up`, `arrow-up`, `check`, `circle-check`, `send`, `trending-up` or `arrow-up-right`, Upmo draws the caret from `assets/icons/caret.svg`. Down chevrons for menus and selects stay Tabler. They are not the mark.
- **Token direction is not the mark.** The 12px glyphs before token counts (in, out) are Tabler `chevron-up` and `chevron-down`. Never flip or rotate the caret to point down. A down caret would be the mark upside down.
- **Status is the caret family.** Queued, Preparing, Planning, Working, Checking, Done and Failed use the five `assets/icons/status-*.svg` marks, each beside its word (see Microcopy). Tabler supplies the other states: clock for needs approval, hourglass for queued, pause for paused.
- **Labels.** A decorative icon next to text is `aria-hidden="true"`. An icon-only control has an `aria-label` from the Microcopy labels and a tooltip with the same text. An icon never carries meaning alone where the user has to act on it. The word is there too, or the tooltip is.
- **Icon-first density.** Upmo follows an icon-first design pattern across toolbars, table rows, message action bars, and rails. Where an action is common (send, copy, download, edit, filter, more), use an `ActionIcon` with an `aria-label` rather than an oversized text button. Hover reveals the text via tooltip, keyboard focus displays it with zero delay, and touch targets preserve a 40px hit area on mobile screens.
- **Alignment.** Icons sit on the visual centre of the text: `vertical-align: -0.125em` inline, flex `align-items: center` in controls. In a 40px control, a 20px icon has 10px above and below. Icon and label are 8px apart, or 6px in `sm` controls.
- **Colour.** Icons take the text colour of their control: `ink` in buttons, `ink-muted` in nav at rest, `emerald-deep` on the active nav item. Status tokens are only for status icons. Never put `emerald` on a 16px icon on Bone (3.9:1). Use `emerald-deep`.
- **Motion.** Icons do not animate. The exceptions are the caret (draw, done fade, lift) and the chevron that rotates 180° on expand (200ms). No spinning refresh, no bouncing bell.

## Map

Concept keys come from `icons.json`. "caret" means the Upmo caret. "status-x" means the status caret asset.

| Area | Concept | Icon |
| --- | --- | --- |
| Navigation | tasks · chats · agents · automations · knowledge · memory · usage · notifications · settings | `list-check` · `message` · `users` · `clock-play` · `books` · `brain` · `chart-bar` · `bell` · `settings` |
| Navigation | search · command palette · sidebar · menu · back · forward · home · external · scroll to top | `search` · `command` · `layout-sidebar` · `menu-2` · `arrow-left` · `arrow-right` · `home` · `external-link` · caret |
| Actions | add · edit · delete · remove / close · copy · copied · download · upload · attach | `plus` · `pencil` · `trash` · `x` · `copy` · caret · `download` · `upload` · `paperclip` |
| Actions | send · stop · pause · resume · retry / regenerate · pin · pinned · archive · unarchive | caret · `player-stop` · `player-pause` · `player-play` · `refresh` · `pin` · `pinned` · `archive` · `archive-off` |
| Actions | more · more (vertical) · filter · sort · expand · collapse · next · previous · link · share | `dots` · `dots-vertical` · `filter` · `arrows-sort` · `chevron-down` · caret · `chevron-right` · `chevron-left` · `link` · `share` |
| Actions | approve · deny · follow up · dictate · light theme · dark theme · sign in · sign out · reveal · hide · drag | caret · `x` · `corner-down-right` · `microphone` · `sun` · `moon` · `login` · `logout` · `eye` · `eye-off` · `grip-vertical` |
| Actions | maximize · minimize · table view · chart view · zoom in · zoom out · notifications · muted · keyboard | `maximize` · `minimize` · `table` · `chart-bar` · `zoom-in` · `zoom-out` · `bell` · `bell-off` · `keyboard` |
| Status | idle · preparing · planning · working · checking · done · failed | status-idle · status-plan · status-plan · status-build · status-build · status-done · status-failed |
| Status | needs approval · paused · queued · stopped · loading · success · info · warning · danger · help | `clock` · `player-pause` · `hourglass` · `x` · caret · caret · `info-circle` · `alert-triangle` · `alert-circle` · `help` |
| Status | locked · unlocked · verified · online · offline | `lock` · `lock-open` · `shield-check` · `wifi` · `wifi-off` |
| Steps | preparing · planning · working · checking · done | `search` · `list-details` · `hammer` · `shield-check` · `flag` |
| Objects | task · chat · agent · provider · model · connector · MCP server · repository · GitHub · sandbox | `list-check` · `message` · `user-hexagon` · `plug` · `cpu` · `plug-connected` · `server` · `git-branch` · `brand-github` · `box` |
| Objects | artifact · code · terminal · database · tokens · budget · cost · schedule · calendar · timezone | `file` · `code` · `terminal-2` · `database` · `coins` · `wallet` · `receipt` · `calendar-clock` · `calendar` · `world` |
| Objects | user · team · email · PDF · text file · code file · JSON · image · audio · folder · tag · key | `user` · `users` · `mail` · `file-type-pdf` · `file-text` · `file-code` · `braces` · `photo` · `file-music` · `folder` · `tag` · `key` |
| Objects | skill · memory · source · automation · workflow · delivery · tool call · SQL · web · version | `book` · `brain` · `file-search` · `clock-play` · `git-merge` · `send` · `tool` · `database` · `world-www` · `versions` |

The IconMap component draws every row from the live Tabler sprite, so you can check the map by eye.

## In code

Mantine: `import { IconListCheck } from '@tabler/icons-react'` with `size={20} stroke={1.75}`. The caret and the status carets ship as SVG files in `@upmo-ai/icons`, next to the concept map. React components for them will come with `@upmo-ai/ui` in a later release. Until then, use the SVG files. Every name in `icons.json` was checked against the 3.31 sprite.
