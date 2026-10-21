# Patterns

How components fit together into pages. Each pattern names its components and the tokens it uses.

## App shell

- `Sidebar` on `surface-200`, `sidebar` wide. It holds the wordmark, the primary nav (Home, Chat, Tasks, Automations, Agents, Knowledge, Usage, then a Workspace group with Settings) and a footer. The footer has setup progress, theme and sign out. The current item sits on `surface-selected`, with `emerald-deep` text and icon.
- Top bar, `topbar` high: sidebar toggle, breadcrumb, the ⌘K launcher, the notifications bell and help. The launcher is a button shaped like a search field.
- Notifications live behind the bell (Tabler `bell`), never in the sidebar. The bell carries a count `Badge` for unread items. It opens a list with approvals and questions first, each with Approve in its row, then finished and failed tasks. The empty list reads "You are up to date" with "Approvals and finished tasks show up here."
- Content sits on `surface-000`, padded by the layout rule, with one `h1`.
- Between `bp-sm` and `bp-md` the sidebar becomes a 56px icon rail with tooltips. Below `bp-sm` it becomes a drawer opened from the top bar. The composer in Chat stays fixed to the bottom on phones.

## Navigation

- `Tabs` switch between views of the same object, such as a task's Activity and Result. They use the underline style with an `emerald-deep` indicator. Arrow keys move between tabs.
- Inside one tab, a `SegmentedControl` switches between two ways to show the same content. A task's Activity tab has Summary (the `Timeline`) and All events (the `EventLog`).
- `Breadcrumbs` show the path when a page is more than one level deep: "Tasks / Daily finance digest". The current page is text, not a link.
- `Pagination` for lists over 50 rows. Infinite scroll appears only in chat history.
- `Menu` holds secondary actions. It opens from an `ActionIcon` with the dots icon. Destructive items come last, in `danger`, after a divider.

## Lists and tiles

- A task, agent or automation is a `Card` tile in an auto-fill grid. That is a grid that fits as many columns as the width allows. The title is `h4`, with one line of `body-sm` metadata. The status `Badge` sits top right and the actions sit bottom right.
- A clickable tile is one link. The whole card turns `surface-hover` on hover and scales to 0.98 on press. Secondary actions inside it are real buttons that stop propagation, so a click on them does not open the tile.
- A selectable tile is for picking one option, such as a provider or an engine. At rest it shows a `border-strong` edge. When selected it shows an `emerald-deep` edge, a `surface-selected` ground and the caret in the corner.
- Use tables (`Table`) for dense data that people compare, such as ledger rows and model lists. The sticky header sits on `surface-200`. Numbers use tabular numerals, so the digits line up. Rows turn `surface-hover` on hover. Below `bp-sm` a table becomes stacked cards, or hides secondary columns behind a "More" disclosure.

## Status and progress

- `StatusCaret` is the one progress indicator for tasks and automations. Queued is `caret-idle`. Preparing and Planning draw the left stroke in `ink`. Working and Checking draw both. Done fills `emerald`. Failed swaps to the X in `danger`. The caret always sits beside its word in a `Badge`, so the state never depends on colour alone.
- Use the `Progress` bar for anything with a known fraction, such as budget used or an upload. The track is `mist` and the fill is `emerald-deep`, with `radius-full`, 4px high. A label with the number sits beside it.
- Work that runs for seconds shows the lift caret with "Thinking" or "Working…" text (`Loader`). Nothing spins.

## Feedback

- `Notification` (toast) appears bottom right, or top centre on phones. It uses `surface-100` and `shadow-md`, with a status icon and one line. It closes by itself after 5s, or 10s when it has an action. New toasts stack at the bottom. It has `role="status"`.
- `Alert` sits inline, above the content it is about, for things that stay: "Task needs approval", "Provider key expired". It is a `surface-100` card with a 4px status edge down the left side. The icon sits in a 32px circle on the status `-soft` tint. It has a title, one line and an optional action.
- Use a confirmation `Modal` only for destructive or expensive actions. The title is the question. The body names what is lost. The primary button names the action ("Delete task"). The secondary button is "Cancel", and it takes focus by default.
- Prefer undo to a confirmation where you can. Archive the chat, then show a toast with "Undo".

## Empty, loading, error

- **Empty** (`EmptyState`): an `icon-lg` icon and an `h3` title that says what would be here. One line of `body` says how to add it, then one primary button. Centred, with `space-12` padding. Never a sad face.
- **Loading**: a `Skeleton` in the shape of the content. A card grid gets card skeletons and a table gets row skeletons. The shimmer runs from `surface-200` to `surface-100`. Show it only after 300ms, so quick loads do not flash.
- **Error**: an `Alert` in `danger` with "Try again". The page keeps whatever did load. One failed request never leaves a blank page.

## Overlays

- `Modal`: centred, `radius-xl`, `shadow-lg`, over `overlay`. It is at most 560px wide (480px for confirmations), and full-screen below `bp-xs`. It holds an `h2` title, the content, and actions aligned right. Escape and the scrim (the dimmed layer behind it) close it, unless the form has unsaved changes.
- A drawer slides in from the right for inspectors, such as task details or tool call output. It is 480px wide, and full width on phones. It uses the same tokens as the modal.
- `Tooltip`: `surface-inverse` with `ink-inverse`, `radius-md` and `caption` text, after a 400ms delay. Use it for icon-only controls and cut-off text. Never put essential information in a tooltip.
- Popovers and menus use `surface-100`, `border`, `shadow-sm` and `radius-lg`.

## Artifacts and the code editor

- Everything a task produces goes into the Artifacts section of the task's Result tab (`ArtifactViewer`), under the task's Summary. Each type has a built-in viewer: PDF, Markdown, text and code, CSV, images and HTML. Any other type gets a download card. Download is always there.
- When a task works on files in its sandbox, such as code in a repository, the Artifacts section also has the "Open in code editor" button (`CodeEditorButton`) above the viewer. A task with no sandbox shows Artifacts only. The code editor is based on Code-OSS, the open-source core of VS Code. It runs with openvscode-server in its own container next to the task's sandbox and sees the same files. The button and the interface call it "code editor" and never name a product.
- **It starts on demand.** Nothing runs until someone presses the button. The button turns busy with the draw `Loader` and reads "Starting the code editor…". This can take a few seconds.
- **It is read only while the task is Working.** A "Read only" `Badge` with the lock icon sits next to the button, with one short reason: "You can edit the files when the task stops." Editing unlocks when the task stops: Done, Failed or Stopped. Nothing else writes to the files then. Edits made after that start a follow-up task, so a finished task is never reopened.
- **It opens in a new browser tab, on its own origin.** It shares no cookies or storage with the Upmo app.
- **It stops when idle.** After a while with no use, the editor stops and frees the sandbox. The button starts it again.

## Chat

- User messages sit on the right, in bubbles on `surface-100`. A bubble uses `radius-lg`, with a 4px bottom-right corner. Assistant replies sit on the left, next to the 20px caret avatar. They have no bubble, only `ink-secondary` prose at `measure` width.
- Tool calls collapse into one group row ("3 tool calls · 2.8 s") with caret bullets. The row expands to show each call in `code`.
- The composer is a `Textarea` in a `radius-xl` container on `surface-100`. It gets `shadow-md` when focused. It has a knowledge `Chip` row, a model picker, attach, mic, and the primary send `ActionIcon`, which carries the caret.
- A metadata row sits under each reply in `body-sm` `ink-muted`: model, tokens, duration, cost. Copy and Activity appear in it as subtle buttons.

## Marketing

- Familjen Grotesk `hero` sets the one headline. Manrope sets everything else. Use `emerald` sparingly: the caret, the "up", one primary button per screen.
- Sections alternate between `surface-000` and `surface-100`. The install section sits on `surface-inverse`.
- The landing page scrolls down, like every other page. Reversed scrolling breaks Home and End, anchor links, trackpad momentum and screen readers. So "up" lives in the content instead. The caret draws upward once on load, and the proof timeline climbs from first step to done.
