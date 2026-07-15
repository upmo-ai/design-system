# CodeEditorButton

The button that opens the code editor for a task that works on files in its sandbox.

## When to use

- Use it on a task page, in the Result tab above the Artifacts viewer, when the task has files in a sandbox. A task with no sandbox shows Artifacts only, with no editor button.

## What the consumer provides

- The task status. While the task is Working, show the "Read only" `Badge` with the lock icon and the reason "You can edit the files when the task stops." When the task stops (Done, Failed or Stopped), show the button alone.

## Behaviour

- An `outline sm` button with the code icon, the label "Open in code editor" and the external-link icon. Screen readers also hear ", opens in a new tab".
- The editor starts on demand. While it starts, the label reads "Starting the code editor…", the icon becomes the draw caret `Loader`, and the button has `aria-busy="true"`. A second click does nothing.
- The editor opens in a new browser tab on its own origin. It stops after it has been idle.
- The button points to the badge and the reason with `aria-describedby`, so the read-only state is announced.
- The code editor is based on Code-OSS. The label never names another product. See Patterns, "Artifacts and the code editor".

## Tokens

`border-strong`, `ink`, `surface-hover`, `focus`, `duration-base`.

## Mantine

`<Button variant="outline" size="sm" leftSection={<IconCode />} rightSection={<IconExternalLink />} loading={starting}>`. Use the draw caret as the `loaderProps` loader, not Mantine's spinner. The badge is `<Badge variant="light" leftSection={<IconLock />}>`.
