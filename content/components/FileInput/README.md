# FileInput

A drop zone that also opens the file picker, with one row per file that shows its progress or why it was rejected.

## When to use

- Use it for task attachments, knowledge uploads and avatar images. In the chat composer, the attach `ActionIcon` opens the same picker without the zone.

## What the consumer provides

- `accept` types and limits. State them in the second line of the zone: "PDF, text, images, audio. Up to 8 files, 25 MB each."
- `onDrop`. A list with one row per file: name, size or progress, and a cancel or remove action.

## Behaviour

- Zone: dashed `border-strong`, `radius-lg`, caret icon in `emerald-deep`. Hover and focus turn the edge `emerald-deep` on `surface-selected`. A file dragged over the zone makes the edge solid. A rejected type turns it `danger` on `danger-soft` while it hovers.
- Rows: `surface-100`, `border`, `radius-md`. A 4px `Progress` shows while the file uploads, then "Done" in `success`. A rejected row says how to fix it.
- Keyboard: the zone is focusable. Enter or Space opens the picker.

## Tokens

`surface-100`, `surface-selected`, `border-strong`, `border`, `emerald-deep`, `danger`, `danger-soft`, `success`, `ink`, `ink-muted`, `radius-lg`, `radius-md`.

## Mantine

`@mantine/dropzone`: `<Dropzone accept={[MIME_TYPES.pdf, …]} maxSize={25 * 1024 ** 2} maxFiles={8} radius="lg">` with `Dropzone.Accept`, `Dropzone.Reject`, `Dropzone.Idle`.
