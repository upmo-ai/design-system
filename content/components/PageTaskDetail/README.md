# PageTaskDetail

A showcase of one task run, with its header, the approval it waits on, a tabbed main column and a side column of cards.

The header shows status and actions. The main column has two tabs: Activity and Result. The page is shown with the collapsed icon rail.

## What it demonstrates

- Header: an `h1` with the status `Badge` next to it and one metadata line that includes the engine, the model and the `StatusCaret`. Actions sit on the right: Pause `outline`, Review approval `filled`, More.
- The top bar holds the notifications bell with its unread count, as on every app page.
- The approval `Alert` with `role="alert"` sits above the content. It names exactly what will happen and offers Approve, Deny and View draft. The task is waiting on a person here, so this comes first.
- `Tabs` for Activity and Result. There are only these two. Budget, delivery, sources and run history live in the side cards, so they get no tab.

## Activity

- A `SegmentedControl` at the top of the tab picks the view: **Summary** or **All events**. Summary is the default.
- **Summary** is the task `Timeline`, with the collapsed tool-call group inside the current step. Its titles are the status words Preparing, Planning, Working and Checking.
- **All events** is the `EventLog`: every event of this run, in plain words, with follow live on because the run is still going. This sample stops at the current event, the approval Upmo asked for. Add `#events` to the preview URL to open this view.
- Under both views sits a `Composer` for messages to the running task, with the placeholder "Message this task…". Upmo reads a message at its next step and replies in the activity. There is no separate steering tab.

## Result

- **Summary** comes first: the task's final answer in a few lines. While the task is not done, the line "The final result shows up here when the task is done." (`result.summary_pending`) takes its place, as in this sample.
- **Artifacts** comes next: the `ArtifactViewer` with the task's files. The artifact count `Badge` sits on the Result tab label. Open the Result tab (or add `#result` to the preview URL) to see the two files.
- This task has no sandbox, so Result shows the viewer only. A task with files in a sandbox also gets the `CodeEditorButton` above the viewer. Patterns, "Artifacts and the code editor", has every state.

## Side cards

The side cards come in this order: Budget, Delivery, Sources, Run history.

- **Budget**: `Progress`, with the pause threshold in words, and a "See usage for this task" link to the Usage page filtered to this task.
- **Delivery** (`DeliveryCard`): where the result goes. This task is still Working, so the card shows the waiting state: "#finance on Slack", "After the task is done", and a "Change" button.
- **Sources**: the task's sources as chips.
- **Run history**: each earlier run with its badge. The card shows only from the second run on. A task on its first run has no history, so it has no card. This sample is Run 14 of a task an automation started, so it has the card.
- The 56px rail takes the place of the full sidebar, with tooltips on hover.

## Responsive

Below `bp-lg` the side column moves under the tabs, and the cards sit in a grid: two side by side on tablets, one per row on phones. Below `bp-xs` the header actions collapse into the More menu. Review approval stays as a full-width button. On phones the `SegmentedControl` takes the full width, and in the event log the phase word moves under the message.
