# PageTasks

A showcase of the Tasks list, built from Sidebar, the top bar, Alert, SegmentedControl, Select, Card and Badge.

## What it demonstrates

- App shell: a 248px `Sidebar` on `surface-200` and a 48px top bar. The top bar holds the sidebar toggle, `Breadcrumbs`, the ⌘K launcher, the notifications bell with its unread count, and Help. The content has `space-8` padding, one `h1` and its one-line description.
- The approval `Alert` sits above the list it is about, with its action inline.
- Filters sit in one row: a `SegmentedControl` for status, `sm` `Select`s for agent and engine ("All agents", "All engines"), and a count of tasks on the right.
- Tiles sit in an `auto-fill, minmax(300px, 1fr)` grid. Each tile is one link with a title, a metadata line (agent, engine, then run details), the status `Badge` with its icon and the `StatusCaret` line. Every status appears: needs approval, working, planning, done, queued, failed.
- Sidebar footer: setup ring, theme, sign out, and the version in `code-sm`.

## Responsive

Below `bp-md` the sidebar becomes the 56px rail. Below `bp-sm` it hides behind the top bar toggle, and the launcher shrinks to its icon. Tiles go one per row.
