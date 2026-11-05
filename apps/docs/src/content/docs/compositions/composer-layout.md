---
title: Composer toolbar layout
description: What changed in the Composer toolbar markup and styles, for apps that style it.
---

The Composer toolbar now wraps onto further lines instead of clipping its pills,
and goes compact in a narrow composer. That changed its markup and styles. If
your app styles the toolbar through the `upmo-composer__*` classes, check these.

## What changed

- The `.upmo-composer__spacer` element is gone. It pushed send to the end of the
  row; the tools area now takes the free space itself.
- The pills, the attach button, the dictate button and the tools pill sit in a
  new `.upmo-composer__tools` wrapper. It wraps onto more lines when they do not
  fit, and keeps a minimum height of one small control.
- Send sits beside that wrapper, as the last child of `.upmo-composer__row`. It
  does not shrink, and it keeps its place on the first line when the tools wrap.
- `.upmo-composer__row` aligns its items to `flex-start`, so send stays on the
  first line instead of centring against a taller, wrapped toolbar.
- In the compact toolbar the root carries `.upmo-composer--compact`, and the
  config pill's accessible name is its label plus the text it shows. The full
  selection is its description. See [Narrow widths](/compositions/overview/#narrow-widths).

## What to do

- Remove any rule that targets `.upmo-composer__spacer`.
- Target the pills and icon buttons through `.upmo-composer__tools` when you
  need to place them, and leave send as the row's last child.
- Do not rely on the row centring its items vertically. Send now lines up with
  the first line of the tools, and a wrapped toolbar grows downward from there.
