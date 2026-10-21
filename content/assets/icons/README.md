# Icons

These files are Upmo's own marks: the caret and the status carets, which Tabler Icons does not have. The product icon set is Tabler Icons (outline, 1.75 stroke), loaded from `@tabler/icons-react`. It is not copied here.

- `caret.svg`: the mark, with an `emerald` stroke. Use it for the favicon, send, done and scroll to top. Minimum 16px.
- `caret-ink.svg`: the mark in `ink`, for one-colour use.
- `caret-bone.svg`: the mark in Bone, on `emerald` or `surface-inverse` grounds.
- `status-idle.svg`: both strokes in `caret-idle`. Task queued.
- `status-plan.svg`: left stroke `ink`, right stroke `caret-idle`. Discover and Plan phases.
- `status-build.svg`: both strokes `ink`. Build and Prove phases.
- `status-done.svg`: both strokes `emerald`. Done.
- `status-failed.svg`: an X in `danger`. Failed, cancelled.

Each file is a single-ink SVG with its colour baked in, so an `<img>` cannot recolour it. A React `CaretStatus` component that takes `currentColor` will come with `@upmo-ai/ui` later. Every status icon sits beside its word.
