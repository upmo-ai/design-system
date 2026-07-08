# Responsive

Upmo is designed for the phone first, then given room on wider screens. Every component is written for 360px first, never the reverse. The words, the components and their order stay the same at every width. Only placement, density and which secondary things are tucked away can change. Someone checking a task on a phone sees the same thing they see at a desk.

## Breakpoints

A breakpoint is a width where the layout changes. These are Mantine's defaults. They are set in `em`, so they scale with the user's font size. The names come from the `breakpoint` tokens.

| Token | From | What changes |
| --- | --- | --- |
| base | 0 | One column. Sidebar is a drawer behind the menu button. Tables become cards. Modals become bottom sheets. |
| `bp-xs` | 576px | Two-column form rows. Chips and filters stay on one line. Chat composer gets the attach and dictate buttons inline. |
| `bp-sm` | 768px | Sidebar becomes the 56px icon rail. Cards two across. Tables return with the first four columns. Modals centre. |
| `bp-md` | 992px | Full 248px sidebar. Cards three across. Page header actions move to the right of the title. |
| `bp-lg` | 1200px | Chat gets its side panel (task detail, sources). Tables show every column. Settings nav sits beside content. |
| `bp-xl` | 1408px | Content stops growing at 1280px and centres. Margins absorb the rest. |

Write styles mobile first: base rules first, then `@media (min-width: 36em)` and up. Never use a `max-width` query, except to hide things that only work on hover on touch screens.

## App shell

| Width | Sidebar | Top bar | Content padding |
| --- | --- | --- | --- |
| base | Drawer, full height, 280px, opens from the menu button. Closes on route change and on scrim tap | 48px: menu, wordmark, search icon, avatar | `space-4` (16px) |
| `bp-sm` | Icon rail 56px, labels in tooltips, expand on hover after 400ms | 48px: search field 240px, avatar | `space-6` (24px) |
| `bp-md` | Full 248px with labels, collapsible to the rail with ⌘B, choice remembered | 48px | `space-8` (32px) |

The content column has a `max-width` of 1280px plus padding. Prose and chat replies stay at `measure` (68ch, about 68 characters per line) inside it.

## Layout rules

- **Grids** use `auto-fill, minmax(320px, 1fr)`. The number of columns follows the width, with no media query. Task tiles, provider tiles and stat tiles all use it.
- **Tables** below `bp-sm` show each row as a card. The first column is the title and the status badge sits top right. Two or three key columns form a meta line. Actions go in the card foot. Above `bp-sm`, columns come back by priority, set per table ("name, status, agent, cost, updated, run"). The lowest priority columns hide first.
- **Page header**: on phones, the title and description stack above the actions. From `bp-md`, the actions move to the right of the title. The primary action is always visible. Below `bp-sm`, secondary actions collapse into a "More" menu.
- **Forms**: one column. From `bp-xs`, related short pairs go side by side. Below `bp-xs`, the actions row stacks at full width with the primary on top. Above it, the actions sit inline, aligned right.
- **Stepper**: the full header from `bp-sm`. Below `bp-sm`, "Step 2 of 4 · Credentials" and a thin progress bar.
- **Chat**: on phones the message column runs edge to edge. The composer is pinned to the bottom, above the safe area (the part of the screen that the notch and home bar do not cover). From `bp-sm`, a 720px column sits centred. The side panel appears from `bp-lg`.
- **Task detail**: on phones, the Activity and Result tabs run across the top. The side cards (budget, delivery, sources, run history) move under the tabs: two side by side on tablets, one per row on phones. From `bp-lg`, the page has two columns.
- **Settings**: on phones, the section list is a `Tabs` row that scrolls sideways. From `bp-lg` it is a vertical nav.
- **Charts**: full width. They are 200px tall on phones and 280px from `bp-sm`. At `bp-md` the legend moves from below the plot to its right. Below `bp-sm` the filter row wraps onto two lines.

## Overlays

- **Modal** below `bp-sm`: a bottom sheet, which is a panel that slides up from the bottom edge. It has `radius-xl` top corners, a drag handle and a max height of 90%. Its content scrolls inside. Above `bp-sm`, it is a centred dialog at 480px or 640px.
- **Drawer**: full width below `bp-xs`, and 360px to 480px above. It always comes from the right. The navigation drawer is the exception: it comes from the left.
- **Menu and Popover**: anchored at every width. If the anchored position does not fit on a phone, the menu becomes a bottom sheet.
- **Command palette**: full screen below `bp-sm`, and a 640px dialog above.
- **Toasts**: on phones, full width minus `space-4`, at the bottom. From `bp-sm`, 360px wide, bottom right.
- **Tooltips** do not open on touch. The label a tooltip would show must already be visible, or be in the sheet's menu.

## Touch and pointer

- Touch targets are at least 40px by 40px, with 8px between them. With a precise pointer such as a mouse (`pointer: fine`), 32px controls are allowed in tables and toolbars.
- Hover states exist only under `(hover: hover)`. Touch devices show the pressed state and nothing else.
- Swipe: swipe a chat list row left to reveal Archive. Swipe a toast to dismiss it. There are no other hidden gestures. Everything you can reach by swipe is also in a menu.
- Use `100dvh`, not `100vh`, for the shell. Then the mobile browser's own bars do not hide the composer. Pad the safe area insets with `env(safe-area-inset-*)`.
- Inputs are 16px on iOS, so the page does not zoom in on focus. This is the only place where the `body` token (15px) is overridden.

## Type and density

- Type does not shrink on phones. The only change is `h1`, which drops from 28px to 24px below `bp-xs`.
- Density is one setting in Appearance: Comfortable or Compact. Compact makes table rows and list items 40px high in place of 48px. It also cuts card padding from `space-5` to `space-4`. It never changes font sizes.
- At 200% zoom every feature must still work, and nothing may be cut off. At 400% the layout is the phone layout. Test with the browser zoom, not by resizing the window.

## Test matrix

Test at 360×780 (small phone), 390×844, 768×1024 (tablet portrait), 1024×768, 1280×800, 1440×900 and 1920×1080. Test each size at 100% and 200% zoom, in light and dark, and with the keyboard only. The Breakpoints component is the quick check: drag its edge and watch the shell re-flow.
