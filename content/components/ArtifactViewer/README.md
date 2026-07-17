# ArtifactViewer

The Artifacts section of a task's Result tab: every file the task produced in a list, and a built-in viewer for the one you pick.

## When to use

- Inside the Result tab of a task (`PageTaskDetail`), under the task's Summary. Everything a task produces lands here, so people never leave Upmo to look at a result.
- For browsing or editing the files a task works on in its sandbox, use the code editor (see Patterns, "Artifacts and the code editor"). Upmo has no other view of the sandbox files.

## What the consumer provides

- `artifacts`: `{ id, name, type, size, createdAt, url }[]`, newest last, in the order the task produced them.
- `value` and `onChange` for the selected artifact. The first one is selected by default. The URL hash holds the selection, so a link can open one artifact.
- With no artifacts, show `EmptyState` with `empty.artifacts`.

## Behaviour

- The list is 260px wide on `surface-200`. Each row shows the type icon, the name and one meta line: type, size and time ("CSV · 12 KB · 08:01"). The selected row is `surface-selected` with `emerald-deep` text and icon, like the current sidebar item.
- The viewer pane has a header with the name, the meta line and the actions. Download (`action.download`) is always there, for every type.
- Viewers by type:
  - **PDF**: pdf.js renders the pages, so a file looks the same in every browser. Pages sit on `surface-200` and stay paper white in every theme.
  - **Markdown**: rendered as `Prose`, with a Rendered / Source toggle (`SegmentedControl`). The rendered output is sanitised: no raw HTML, no scripts, and links open in a new tab.
  - **Text, JSON and code**: Monaco in read-only mode, with line numbers and the four `CodeBlock` token colours.
  - **CSV**: a `Table` with a sticky header and tabular numerals.
  - **Image**: shown inline, scaled to fit, on `surface-200`.
  - **HTML**: rendered in a sandboxed frame with no scripts and no access to the app (`sandbox` with no `allow-scripts` and no `allow-same-origin`, on its own origin).
  - **Anything else**: a download card. It is an `EmptyState` with `empty.artifact_preview`: "Upmo cannot preview this file" and one Download button.
- Below `bp-sm` the list becomes one row that scrolls sideways above the viewer.

## Accessibility

- The list is a `tablist` with `aria-orientation="vertical"`, and each panel is a `tabpanel`. It is one Tab stop. Up and Down (and Left and Right) move and select. Home and End jump to the ends. This is the same model as `Tabs`.
- The Rendered / Source toggle is a group of two buttons with `aria-pressed`.
- Type icons are `aria-hidden`. The type is also in words in the meta line.

## Tokens

`surface-100`, `surface-200`, `surface-selected`, `surface-hover`, `border`, `border-strong`, `radius-lg`, `radius-md`, `ink`, `ink-muted`, `emerald-deep`, `shadow-md`.

## Mantine

`Tabs orientation="vertical"` with `Tabs.List` for the list and one `Tabs.Panel` per artifact. Use `SegmentedControl` for Rendered / Source, `Table` for CSV and `EmptyState` for the download card. pdf.js (`pdfjs-dist`) and `@monaco-editor/react` with `options={{ readOnly: true }}` load only when their viewer opens.
