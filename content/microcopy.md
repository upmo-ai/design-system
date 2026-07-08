# Microcopy

Every string a person reads in Upmo, written once in one place. Product code, docs and Upmo's own agents copy from this list. Nobody invents a new phrasing. That way the same action is never "Delete" on one screen and "Remove" on the next. The machine-readable copy is `microcopy.json`, and the keys below are its keys.

## Voice

- **Plain and direct, in the second person.** Talk to the reader as "you". Write "Your key was rejected." Never "The provided credential could not be validated."
- **Say what happens, not what you feel.** Never write "Oops", "Sorry", "Great!" or "Successfully". A toast reads "Task started", not "Successfully started your task!".
- **Who speaks.** Interface chrome (the menus, labels and messages around the content) speaks as Upmo, in the third person: "Upmo could not reach OpenAI." An agent speaks as "I", inside its chat and nowhere else. Upmo never says "we".
- **Verbs first.** Buttons start with a verb and name the outcome: "Connect provider", "Create task". Labels and titles are nouns.
- **One idea per sentence.** Errors are two sentences at most. The first says what went wrong. The second says what to do.
- **Reading level.** A person who is not technical should understand every string outside code blocks. Write "key", not "credential". Write "connect", not "authenticate", and "working", not "executing".
- **Sentence case** everywhere: only the first word and names take a capital. Titles, labels, buttons, badges, tabs and menu items end without a period. Full sentences in body text, descriptions, toasts and errors end with one.
- **No em dashes, no emoji, no exclamation marks, no ellipsis.** The one exception is the three dots in a progress label ("Testing…").

## Vocabulary

The product words (task, chat, run, engine, usage, notifications, folder, workspace and the status words) are in the Glossary. It is the source for those words. This table covers the other words people read.

| Use | Never | Note |
| --- | --- | --- |
| Agent | bot, assistant, AI, model | Model is the LLM a provider serves. Agent is the persona. |
| Provider | vendor, backend, LLM | OpenAI, Anthropic, Ollama |
| Connector | integration, plugin, app | GitHub, Gmail, an MCP server |
| Automation | cron, schedule, trigger | The schedule is the automation's field, not its name. |
| Knowledge | KB, RAG, documents | "Knowledge" is the section. A single item is a "source". |
| Memory | context, history | What Upmo remembers about you. |
| Approval | confirmation, gate | A task "needs approval". You "approve" or "deny". |
| Artifact | output, deliverable, file | What a task produced. |
| Working | running, executing, processing | The live status word. |
| Stop | abort, kill, terminate | Stop a working task. |
| Cancel | | Cancel something scheduled that has not started, or back out of a dialog. |
| Archive | hide, close | Takes chats and tasks out of view. You can bring them back. |
| Delete | remove, destroy, purge | Cannot be undone. Always confirmed. |
| Remove | delete, unlink, detach | Detaches something, and can be undone: remove a connector from an agent, remove a source. |
| Done | completed, finished, success | The final status when the work succeeded. |
| Failed | error, errored, crashed | The final status when the work did not succeed. |
| Settings | preferences, configuration, options | |
| Sign in / Sign out | log in, login, log out | |
| Key | API key, token, secret, credential | "Key" in labels. "API key" only where the provider calls it that. |
| Tokens | | Only ever the LLM unit, with a count. |
| Budget | limit, cap, quota | Money or tokens a task may spend. |

## Actions

Buttons, menu items and links. Each row gives the key, the label and where it appears.

| Key | Label | Use |
| --- | --- | --- |
| `action.create_task` | Create task | Primary on the task form |
| `action.start_task` | Start task | Primary when a draft exists |
| `action.stop_task` | Stop task | Danger, while working |
| `action.run_again` | Run again | Starts a new run of a finished task |
| `action.pause` / `action.resume` | Pause / Resume | |
| `action.retry` | Try again | After any failure. Never "Retry". |
| `action.approve` / `action.deny` | Approve / Deny | Approval alert |
| `action.review` | Review | Opens the approval detail |
| `action.follow_up` | Follow up | Creates a follow-up task |
| `action.new_chat` | New chat | |
| `action.send` | Send | Composer. The icon is the caret |
| `action.stop_generating` | Stop | Composer while streaming |
| `action.regenerate` | Regenerate | |
| `action.copy` / `action.copied` | Copy / Copied | Label flips for 2 s |
| `action.edit` | Edit | |
| `action.save` | Save changes | Forms with a submit. Single-value settings auto-save and show "Saved". |
| `action.cancel` | Cancel | Secondary in every dialog |
| `action.continue` / `action.back` | Continue / Back | Stepper |
| `action.skip` | Skip for now | Onboarding, optional steps |
| `action.finish` | Finish | Last stepper step when no better verb exists |
| `action.connect` / `action.disconnect` | Connect / Disconnect | Providers and connectors |
| `action.test` / `action.testing` | Test connection / Testing… | |
| `action.add_provider` | Add provider | Also `Add connector`, `Add agent`, `Add automation`, `Add source` |
| `action.archive` / `action.unarchive` | Archive / Unarchive | |
| `action.delete` | Delete | Danger. Confirmed with the item name. |
| `action.remove` | Remove | Reversible |
| `action.undo` | Undo | In toasts, 5 s |
| `action.view_all` | View all | Links from summaries |
| `action.show_more` / `action.show_less` | Show more / Show less | Spoiler |
| `action.download` | Download | Artifacts |
| `action.open_in` | Open in {app} | GitHub, the sandbox |
| `action.open_code_editor` | Open in code editor | Result tab, above the artifacts, when the task has files in its sandbox |
| `action.clear_filters` | Clear filters | |
| `action.sign_in` / `action.sign_out` | Sign in / Sign out | |
| `action.dismiss` | Dismiss | aria-label of every close button on toasts and alerts |
| `action.close` | Close | aria-label of the X on modals and drawers |

Never use Submit, OK, Yes, No, Confirm, Proceed, Go, Click here or Learn more. In place of "Learn more", link the noun: "Read the provider guide".

## Status words

Each status is a colour, an icon and a word, always together. Someone checking on a working task should never have to read colour alone. A task moves through Preparing, Planning, Working and Checking, then ends Done or Failed. The same words name the timeline steps and the badge, so people learn one set.

| Key | Word | Icon | Colour | Meaning |
| --- | --- | --- | --- | --- |
| `status.draft` | Draft | idle caret | `ink-muted` | Not started |
| `status.queued` | Queued | idle caret | `ink-muted` | Waiting for a free slot |
| `status.preparing` | Preparing | plan caret | `ink` | Reading the goal and sources |
| `status.planning` | Planning | plan caret | `ink` | Writing the steps |
| `status.working` | Working | build caret, lifting | `ink` | Doing the steps |
| `status.checking` | Checking | build caret | `ink` | Testing and reviewing the result |
| `status.needs_approval` | Needs approval | clock | `warning` | Blocked on you |
| `status.paused` | Paused | pause | `ink-muted` | By you |
| `status.done` | Done | done caret | `success` | |
| `status.failed` | Failed | X | `danger` | Includes budget and timeout. The detail says which |
| `status.stopped` | Stopped | X | `ink-muted` | By you |
| `status.cancelled` | Cancelled | X | `ink-muted` | Before it started |

A status line shows the status word only, with no counts: "Working", "Planning", "Done". A Failed line may keep a short reason after a middle dot: "Failed · budget reached", "Failed · timed out after 20 min", "Failed · provider key rejected". The reason is not a count.

Providers and connectors: `Connected`, `Not connected`, `Rate limited`, `Key rejected`, `Offline`. Automations: `On`, `Off`, `Next run {relative}`.

## Empty states

Each empty state has a title, a body and one action. The title says what is missing, without "No". The body says what will appear here. The action is the way to get it. An empty filter result is not the same as an empty surface, so each gets its own copy.

| Key | Title | Body | Action |
| --- | --- | --- | --- |
| `empty.tasks` | Your first task | Give Upmo a goal. It plans the work, does it and checks the result while you do something else. | Create task |
| `empty.tasks_filtered` | Nothing matches | Try another status, agent or date range. | Clear filters |
| `empty.chats` | Start a chat | Ask a question, paste a file, or describe what you want done. | New chat |
| `empty.artifacts` | Nothing produced yet | Artifacts appear here as the task finishes its steps. | |
| `empty.artifact_preview` | Upmo cannot preview this file | Download it to open it with an app on your computer. | Download |
| `empty.providers` | Connect a provider | Upmo needs at least one model to think with. Local Ollama works without a key. | Add provider |
| `empty.connectors` | Connect your tools | GitHub, email, calendar and any MCP server. Agents use only the connectors you add. | Add connector |
| `empty.automations` | Run tasks on a schedule | A daily digest, a weekly review, a check every hour. | Add automation |
| `empty.knowledge` | Give Upmo something to read | Upload files or point to a folder. Agents search it when it helps. | Add source |
| `empty.memory` | Nothing remembered yet | Upmo keeps facts you tell it and lessons from tasks. You can delete any of them. | |
| `empty.search` | No results for "{query}" | Check the spelling or try a shorter word. | |
| `empty.notifications` | You are up to date | Approvals and finished tasks show up here. | |
| `empty.offline` | Upmo is not reachable | Check that the server is running, then try again. | Try again |

## Errors

Pattern: **what went wrong** (past tense, concrete), then **what to do** (an instruction). Name the thing by its label. Never blame the user ("you entered"). Never apologise. Never show an error code or stack trace in the message. Put those behind "Show details". When a task fails, the person needs the next step first.

| Key | Message |
| --- | --- |
| `error.key_rejected` | {provider} rejected the key. Check it in Settings and try again. |
| `error.key_format` | Enter a key that starts with {prefix}. |
| `error.provider_unreachable` | Upmo could not reach {provider}. Check your connection and try again. |
| `error.rate_limited` | {provider} is rate limiting requests. Upmo will retry in {seconds} s. |
| `error.no_provider` | No provider is connected. Add one in Settings to start. |
| `error.model_unavailable` | {model} is not available on {provider}. Pick another model. |
| `error.budget_reached` | The task reached its budget of {budget}. Raise the budget and resume, or stop here. |
| `error.timeout` | The task ran for {duration} without finishing. Stop it, or give it more time. |
| `error.sandbox_failed` | The sandbox could not start. Check that Docker is running on the server. |
| `error.repo_not_found` | Upmo could not find {repo}. Check the name and that the connector can read it. |
| `error.repo_no_push` | Upmo cannot push to {repo}. Pick a repository you can push to. |
| `error.required` | Enter {field}. |
| `error.too_long` | Keep {field} under {max} characters. |
| `error.invalid_url` | Enter a full address, starting with https://. |
| `error.invalid_cron` | Enter a valid schedule. Example: every weekday at 9:00. |
| `error.file_too_large` | {name} is larger than {max}. Pick a smaller file. |
| `error.file_type` | Upmo cannot read {type} files. Use PDF, text, Markdown, images or audio. |
| `error.network` | The server did not respond. Try again. |
| `error.not_found` | This {thing} no longer exists. It may have been deleted. |
| `error.forbidden` | You do not have access to this {thing}. |
| `error.unknown` | Something went wrong on the server. Try again, and if it keeps happening check the server logs. |
| `error.details` | Show details / Hide details |

Field errors use the field's label in `{field}`: "Enter a goal." "Keep the name under 80 characters."

## Confirmations

Ask for confirmation only before actions that cannot be undone or that are costly. The title names the action and the item. The body says what is lost. The confirm button repeats the verb. The cancel button is "Cancel" or the safe choice.

| Key | Title | Body | Confirm | Cancel |
| --- | --- | --- | --- | --- |
| `confirm.delete_task` | Delete "{name}"? | Its runs, artifacts and sandbox are removed. This cannot be undone. | Delete task | Cancel |
| `confirm.delete_chat` | Delete this chat? | Messages are removed for good. Archive it instead to keep it. | Delete chat | Archive instead |
| `confirm.stop_task` | Stop "{name}"? | Work done so far is kept. You can follow up later. | Stop task | Keep working |
| `confirm.disconnect_provider` | Disconnect {provider}? | Agents using its models will fail until you pick another. | Disconnect | Cancel |
| `confirm.remove_connector` | Remove {connector} from {agent}? | The agent loses access at once. The connector stays available to others. | Remove | Cancel |
| `confirm.discard_changes` | Discard changes? | What you typed in this form will be lost. | Discard | Keep editing |
| `confirm.delete_key` | Delete this key? | Everything using it stops working. Add a new key first if you need continuity. | Delete key | Cancel |
| `confirm.approve_action` | Let {agent} {action}? | {detail} | Approve | Deny |
| `confirm.sign_out` | Sign out? | | Sign out | Cancel |

A delete confirmation never has a "Don't ask again" checkbox. Ask people to type the name only when they delete an agent or a provider with history.

## Toasts

A toast is the short message that slides in after an action. It is not the same as the notifications list behind the bell (see Patterns).

A toast stays for four seconds, or five with an action. The title is two to four words. The body is optional. A toast has one action at most.

| Key | Title | Body | Action |
| --- | --- | --- | --- |
| `toast.task_started` | Task started | {name} is preparing. | View |
| `toast.task_done` | Task done | {name} produced {count, plural, one {# artifact} other {# artifacts}}. | View |
| `toast.task_failed` | Task failed | {name}: {reason} | View |
| `toast.needs_approval` | Needs approval | {agent} wants to {action}. | Review |
| `toast.saved` | Saved | | |
| `toast.copied` | Copied | | |
| `toast.archived` | Chat archived | | Undo |
| `toast.deleted` | {thing} deleted | | |
| `toast.connected` | {provider} connected | | |
| `toast.automation_on` | Automation on | Next run {relative}. | |
| `toast.offline` | Connection lost | Upmo is retrying. | |
| `toast.online` | Back online | | |
| `toast.update` | Upmo {version} is ready | Reload to use it. | Reload |

## Form hints

Descriptions sit under the control. They say where the value comes from or what it does. Placeholders show the format only.

| Key | Label | Description | Placeholder |
| --- | --- | --- | --- |
| `field.goal` | Goal | What should be true when the task is done. Be specific about the result, not the steps. | Add a weekly spend report to the dashboard |
| `field.task_name` | Name (optional) | Shown in lists. Upmo suggests one from the goal. | |
| `field.agent` | Agent | Who does the work. The general agent handles most goals. | |
| `field.repo` | Repository | Where the agent works. Pick one the GitHub connector can push to. | owner/name |
| `field.budget` | Budget | The most this task may spend. It stops and asks when it gets there. | €2.00 |
| `field.api_key` | API key | From the {provider} dashboard, under API keys. Stored encrypted, never shown again. | sk-… |
| `field.base_url` | Server address | Where the model runs. Local Ollama is http://localhost:11434. | https:// |
| `field.model` | Model | Which model answers. Cost per 1k tokens is shown next to each. | |
| `field.schedule` | Schedule | When the automation runs, in your timezone ({tz}). | Every weekday at 9:00 |
| `field.display_name` | Your name | How agents address you. | |
| `field.timezone` | Timezone | Used for schedules and times in the app. | |
| `field.search` | | | Search tasks, chats and knowledge |
| `field.composer` | | | Ask anything, or describe a task |

## Tooltips and labels for icon-only controls

An icon-only button has an `aria-label` (the name a screen reader reads out) and a tooltip with the same text. Write a verb plus an object, in two or three words. A keyboard shortcut goes after a middle dot, in the tooltip only.

`Copy reply`, `Edit message`, `Regenerate`, `Stop`, `Send · Enter`, `New line · Shift+Enter`, `Attach file`, `Dictate` (disabled: `Enable the whisper profile to dictate`), `Open command palette · ⌘K`, `Toggle sidebar · ⌘B`, `Switch theme`, `Notifications`, `Task details`, `Open in GitHub`, `Download artifact`, `Pin chat`, `Archive chat`, `More actions`, `Dismiss`, `Close`, `Back`, `Scroll to top`.

## Tasks and agents in the interface

Live strings shown while a task runs. Streaming text belongs to the agent. Everything below is Upmo's own voice.

| Key | String |
| --- | --- |
| `live.thinking` | Thinking… |
| `live.reading` | Reading {source}… |
| `live.searching` | Searching {where}… |
| `live.tool` | Running {tool}… |
| `live.tool_done` | {tool} · {duration} |
| `live.tool_failed` | {tool} failed · {reason} |
| `live.step` | Step {n} of {total} · {title} |
| `live.phase_done` | {phase} done in {duration} |
| `live.waiting_approval` | Waiting for your approval |
| `live.streaming_stopped` | Stopped. The reply above is incomplete. |
| `live.sandbox_starting` | Starting the sandbox… |
| `live.editor_starting` | Starting the code editor… |
| `live.verifying` | Checking the result… |
| `live.review` | Reviewing the work… |
| `live.cost` | {tokens} tok · {money} |
| `live.cost_unknown` | {tokens} tok · cost unknown |
| `approval.title` | {agent} wants to {action} |
| `approval.body` | {detail} Approve to continue, deny to let the agent find another way. |
| `approval.expired` | This approval expired. The task stopped. |
| `agent.first_message` | What should I work on? |
| `agent.cannot` | I cannot do that with the connectors I have. {alternative} |

Agents never say "As an AI", "I apologise", "Certainly" or "Great question". An agent that is unsure says what it would need: "I need the GitHub connector to open a pull request."

## The task page

A task page has two tabs, Activity and Result. `PageTaskDetail` shows them.

| Key | String | Use |
| --- | --- | --- |
| `tab.activity` | Activity | The first task tab |
| `tab.result` | Result | The second task tab. The artifact count `Badge` sits beside it |
| `activity.views` | Activity view | `aria-label` of the `SegmentedControl` at the top of Activity |
| `activity.summary` | Summary | The view with the status `Timeline`. The default |
| `activity.all_events` | All events | The view with the `EventLog`. Also the `aria-label` of the log |
| `result.summary` | Summary | Heading of the final answer in Result |
| `result.summary_pending` | The final result shows up here when the task is done. | In place of the answer while the task is not done |
| `result.artifacts` | Artifacts | Heading of the artifacts in Result |

## Event log

Strings for the `EventLog`. The icon buttons follow the rule for icon-only controls: the `aria-label` and the tooltip are the same text.

| Key | String | Use |
| --- | --- | --- |
| `count.events` | {count, plural, =0 {No events yet} one {# event} other {# events}} | The count at the start of the toolbar: "14 events" |
| `events.follow` | Follow live | Toggle button with `aria-pressed`. Only while the run is going |
| `events.following` / `events.not_following` | Following live / Not following | The state next to the count, on wider screens |
| `events.jump_top` / `events.jump_bottom` | Jump to top / Jump to bottom | Icon buttons that scroll the log |
| `events.copy` | Copy log | Icon button. The label flips to `action.copied` for 2 s |
| `events.full_screen` / `events.exit_full_screen` | Full screen / Exit full screen | Icon button. Escape also exits |
| `events.type` | Event type | Label of the raw event name in an expanded row |
| `events.engine` / `events.model` / `events.duration` / `events.tool_calls` | Engine / Model / Duration / Tool calls | Labels in an expanded model turn |

An event message is plain words, never the raw event name: "Plan written: 4 steps", "Sent to #finance on Slack". It may carry a count, such as "4 of 4 checks passed". The no-count rule is for status lines only.

## Delivery

Strings for the `DeliveryCard`. Delivery is where a task's result goes. Each place is a delivery target.

| Key | String | Use |
| --- | --- | --- |
| `delivery.title` | Delivery | The card title |
| `delivery.target` | {target} on {service} | One target: "#finance on Slack" |
| `delivery.after_done` | After the task is done | Under the target while the task is not done |
| `delivery.change` | Change | `subtle sm` button while waiting |
| `delivery.sending` | Sending | `Badge` while it sends |
| `delivery.delivered` | Delivered {time} | `success` `Badge`: "Delivered 08:06" |
| `delivery.failed` | Failed | `danger` `Badge`, followed by a short reason: "Slack key rejected" |
| `action.retry` | Try again | Button next to a failed target |
| `delivery.none` | Results stay in Upmo | When the task has no target |
| `delivery.add` | Add | Link when the task has no target. Its accessible name is `delivery.add_label`: "Add delivery target" |

## Artifacts and the code editor

Strings for the artifacts in the Result tab and the code editor. Patterns describes the states.

| Key | String | Use |
| --- | --- | --- |
| `result.artifacts` | Artifacts | Heading in the Result tab. The count `Badge` sits on the Result tab label |
| `artifact.view.rendered` / `artifact.view.source` | Rendered / Source | Toggle on a Markdown artifact |
| `action.download` | Download | In the viewer header, for every artifact. The icon-only form is `Download artifact` |
| `action.open_code_editor` | Open in code editor | Opens the code editor in a new browser tab |
| `live.editor_starting` | Starting the code editor… | On the button while the editor starts |
| `editor.read_only` | Read only | `Badge` next to the button while the task is Working |
| `editor.read_only_reason` | You can edit the files when the task stops. | One line next to the badge |
| `empty.artifact_preview` | Upmo cannot preview this file | The download card for a type with no viewer |

The button says "code editor", never a product name.

## Permissions

Each connector has one setting for changes. Connecting a connector lets agents read through it. For changes (create, update, send) the person picks one of three choices. The default is Ask first. Deleting always asks first, even under Allow. When they connect it, people also pick what it can reach: All, or Only these (repositories, folders, labels). Rules for single actions sit under Advanced on the connector page, never in the main view.

| Key | String | Meaning |
| --- | --- | --- |
| `permission.allow` | Allow | Agents make changes without asking |
| `permission.ask` | Ask first | Agents ask for approval before each change. The default |
| `permission.block` | Block | Agents cannot make changes |
| `permission.changes` | Changes | Label of the setting. Description: "Creating, updating and sending. Deleting always asks first." |
| `permission.reach` | What it can reach | Label of the reach choice: `All` (`permission.reach.all`) or `Only these` (`permission.reach.only`) |
| `permission.advanced` | Advanced | Section on the connector page for rules on single actions |

## Time, numbers, plurals

- **Relative time** for anything under 7 days: "just now", "2 min ago", "3 h ago", "yesterday", "4 days ago". After that, show the date: "12 Oct", or "12 Oct 2025" when it falls in another year. Hover shows the exact time in the user's timezone, 24-hour: "12 Oct 2026, 14:03".
- **Future**: "in 2 h", "tomorrow at 9:00", "Mon at 9:00".
- **Durations**: "4.2 s", "1 min 20 s", "2 h 05 min". Never "00:01:20".
- **Tokens**: "12k", "1.2M", exact on hover: "12,340 tokens". Show input and output as two counts. A 12px glyph comes before each: Tabler `chevron-up` for input, `chevron-down` for output. These are direction glyphs, not the mark. The mark is never rotated. The hover reads "12,340 input · 1,180 output". Screen readers get "12k in, 1.2k out".
- **Money**: use the account currency symbol, two decimals under 1, three under 0.1: "€4.20", "€0.42", "€0.011". Unknown cost is the word "unknown", never a dash and never 0. Upmo never guesses a cost.
- **Counts**: every string with a count uses an ICU plural. This format picks the right word form for each number: `{count, plural, one {# task} other {# tasks}}`. In a sentence, zero is a word: "No tasks yet", not "0 tasks".
- **File sizes**: "240 KB", "1.2 MB", one decimal above 1 MB.
- **Percent**: "38%", no space, no decimals unless under 1%.
- **Ranges and arrows**: no arrow characters anywhere. Up and down are the caret glyphs. Ranges use "to": "9:00 to 17:00".
- **Locale**: numbers and dates follow the browser locale (its language and region settings) through `Intl`. Strings are written in English first. The JSON is the source for translation.

## Keys and format

`microcopy.json` holds every string in this section as `"category.key": "string"`, with ICU MessageFormat placeholders. A string that changes a word based on a number uses `plural`. A key never changes once it ships. A replaced meaning gets a new key, and the old key is deleted in the same change. Docs quote interface labels, so a label change needs a docs change too.
