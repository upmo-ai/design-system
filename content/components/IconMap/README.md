# IconMap

A review tool that draws all of `icons.json` from the live Tabler sprite, with Upmo's own marks (caret, status carets) inline where the map names them.

Switch between 16, 20 and 24px to check each glyph at the sizes the system allows.

- `icons.json` is the source of truth. This preview carries a copy of it. It reports any name the sprite does not have.
- Each concept has one icon everywhere. Add a new concept to the map before it gets an icon in code.
- See the Icons section for the stroke, size, colour and label rules.

Mantine: `@tabler/icons-react`, `size={20} stroke={1.75}`. The caret and status caret SVG files ship in `@upmo-ai/icons`. React components for them come with `@upmo-ai/ui` later.
