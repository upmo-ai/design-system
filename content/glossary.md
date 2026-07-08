# Glossary

Upmo uses words that people already know from the apps they use every day. One concept has one word, and that word is the same everywhere a person can see it: the interface, the microcopy, the docs and the API paths. The code uses the same words, so a designer, a developer and a user all name a thing the same way. If a word is not in this list, check Microcopy before you invent one. If a word is in the right-hand column, do not use it, in any surface.

| Word | What it means | Words we do not use |
| --- | --- | --- |
| Task | A piece of work you give to Upmo. It has a goal, a status and its runs. | mission, job, workflow |
| Subtask | A smaller task inside a task. One word, no hyphen. | sub-mission, sub-task, child task |
| Chat | Talking to Upmo or an agent, message by message. | conversation, session, thread |
| Run | One execution of a task. "Run again" starts a new one. "Run history" lists them. | attempt, execution |
| Preparing, Planning, Working, Checking, Done, Failed | The status words of a task, in that order. Done and Failed are where a task ends. Queued, Needs approval, Paused and Stopped are extra states that can appear on the way. | discover, plan, build, prove, result (as labels), getting ready, running |
| Engine | The program that does the work of a task. The names are Upmo (built in), Claude Code, Codex, OpenCode, Cursor and Pi. | harness, executor, runner |
| Usage | The page that shows spend and activity. | analytics, insights, reports |
| Notifications | The things that need you or that finished. They live behind the bell in the top bar, not in the sidebar. Approvals and questions come first, with Approve in the row. | inbox, alerts, activity feed |
| Folder | A group of sources inside Knowledge. | collection, space, bucket |
| Workspace | Your organisation's space in Upmo. Teams live inside it. The files a task works on in its sandbox are "files", never a workspace. | tenant, account, project |
| Allow, Ask first, Block | The permission for changes. Each connector has one choice for changes (create, update, send). Connecting a connector allows reading. Ask first is the default. Deleting always asks first, even under Allow. At connect time you pick what it can reach: All, or Only these. Engines use the same three words per group. Rules for single actions sit under Advanced on the connector page. | read, write, read and write, auto-approve, deny list |
| Agent | The persona that does the work, with its instructions, model and connectors. | bot, assistant, AI |
| Automation | A task that runs on a schedule or a trigger. | cron, job, recurring task |
| Connector | A link to an outside service, such as GitHub, Gmail or an MCP server. | integration, plugin, app |
| Memory | What Upmo remembers about you and your work. | context, history |
| Skills | Instructions and know-how that an agent can load when it needs them. | plugins, abilities |
| Approval | A question Upmo asks before it does something you would want to check. You approve or deny it. | confirmation, gate |
| Follow-up | A new task that starts from a finished one and knows what it found. A finished task is never reopened. | reopen, continuation |
| Artifacts | The files a task produces. They live in the task's Result tab, under Artifacts, with a viewer for each type. One file is an artifact. | outputs, deliverables, file browser |
| Delivery | Where a task's result goes, such as a Slack channel or an email address, and whether it got there. Each place is a delivery target. | destination, send results to |
| Code editor | The editor for the files in a task's sandbox. It opens in its own browser tab. It is read only while the task is Working. | IDE, file browser |

There is no task type. People do not pick "coding", "research" or "general", and no screen shows a type field, filter or badge. Upmo works out what kind of work a goal needs.
