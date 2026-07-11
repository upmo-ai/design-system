# Brands

These are the official marks of the services Upmo connects to: model providers, connectors and runtimes. They appear in `BrandTile`, `BrandSelect` and connector rows. A mark always sits next to the service's name, so people recognise what they are picking.

## Rules

- Use official artwork in official colours. Take it from the owner's site, or from a maintained icon set that follows the owner's brand kit. Nobody draws, traces or hand-colours a mark here. A colour comes either with the artwork (Lobe colour variants) or from the set's published brand hex (Simple Icons `data/simple-icons.json`). Never reshape, crop or rotate a mark. Never give it a shadow or put it on a tinted ground. The one allowed change is grayscale at 60% opacity when the option is disabled.
- Some official marks are single-colour black: OpenAI, Anthropic, Ollama, OpenRouter, xAI, Groq, GitHub, Notion. They ship with `fill="currentColor"` and inherit `ink`. So they stay black on Bone and turn Bone on Ink.
- Some marks have a dark published colour, with a relative luminance (how bright a colour is) under 0.05: Slack, Confluence, Zendesk, Sentry. They carry `u-brand--deep` and draw in `ink` on the dark and hc themes. Their owners' own dark-mode kits do the same. The light theme keeps the published hex.
- Sizes: 20px in rows and triggers, 24px in tables and cards, 40px in tiles. Never smaller than 16px.
- Where: pickers, connector lists, "Connected to" lines, the model name in a chat metadata row, and the header of a code block. In a code block header the mark is a language mark from `assets/languages`, at 16px, always next to the language name. Nowhere else. Never in the Upmo wordmark, the OG card, the app icon, the landing hero or paid ads. Never next to "powered by" or "partner" unless a written partner agreement exists.
- Every mark is `aria-hidden`. The visible name beside it is the accessible label.
- The site footer says: "Third-party names and logos are trademarks of their owners and identify services Upmo can connect to."

## Sources

| File | Service | Source, licence of the file | Brand guidelines |
| --- | --- | --- | --- |
| `openai.svg` | OpenAI | Lobe Icons (MIT) | openai.com/brand |
| `anthropic.svg` | Anthropic | Lobe Icons (MIT) | anthropic.com/legal |
| `google.svg`, `gemini.svg` | Google, Gemini | Lobe Icons (MIT), colour variant | about.google/brand-resource-center |
| `ollama.svg` | Ollama | Lobe Icons (MIT) | github.com/ollama |
| `openrouter.svg` | OpenRouter | openrouter.ai site header mark (copied as published, 2026-10-20) | openrouter.ai |
| `bedrock.svg`, `aws.svg` | Amazon Bedrock, AWS | Lobe Icons (MIT), colour variant | aws.amazon.com/trademark-guidelines |
| `mistral.svg` | Mistral AI | Lobe Icons (MIT), colour variant | mistral.ai |
| `xai.svg` | xAI | Lobe Icons (MIT) | x.ai |
| `zai.svg` | Z.ai | Lobe Icons (MIT), the Z glyph as on z.ai (the old `zhipu` dotted ring was the parent company's mark) | z.ai |
| `azure.svg` | Azure OpenAI | Lobe Icons (MIT), colour variant | learn.microsoft.com/azure/brand |
| `vertexai.svg` | Google Vertex AI | Lobe Icons (MIT), colour variant | about.google/brand-resource-center |
| `cohere.svg` | Cohere | Lobe Icons (MIT), colour variant | cohere.com |
| `perplexity.svg` | Perplexity | Lobe Icons (MIT), colour variant | perplexity.ai |
| `together.svg` | Together AI | Lobe Icons (MIT), colour variant | together.ai |
| `fireworks.svg` | Fireworks AI | Lobe Icons (MIT), colour variant | fireworks.ai |
| `huggingface.svg` | Hugging Face | Lobe Icons (MIT), colour variant | huggingface.co/brand |
| `cerebras.svg` | Cerebras | Lobe Icons (MIT), colour variant | cerebras.ai |
| `moonshot.svg` | Moonshot (Kimi) | Lobe Icons (MIT) | moonshot.ai |
| `qwen.svg` | Qwen (Alibaba) | Lobe Icons (MIT), colour variant | qwen.ai |
| `meta.svg` | Meta Llama | Lobe Icons (MIT), colour variant | about.meta.com/brand/resources |
| `lmstudio.svg` | LM Studio | Lobe Icons (MIT) | lmstudio.ai |
| `vllm.svg` | vLLM | Lobe Icons (MIT), colour variant | github.com/vllm-project |
| `nvidia.svg` | NVIDIA NIM | Lobe Icons (MIT), colour variant | nvidia.com/en-us/about-nvidia/legal-info/logo-brand-usage |
| `linear.svg` | Linear | Simple Icons (CC0), brand hex `5E6AD2` | linear.app/brand |
| `trello.svg`, `confluence.svg` | Atlassian | Simple Icons (CC0), brand hex `0052CC`, `172B4D` (deep) | atlassian.design/resources/logo-library |
| `asana.svg` | Asana | Simple Icons (CC0), brand hex `F06A6A` | asana.com/brand |
| `gitlab.svg` | GitLab | Simple Icons (CC0), brand hex `FC6D26` | about.gitlab.com/press/press-kit |
| `googledrive.svg`, `googlesheets.svg` | Google Workspace | Simple Icons (CC0), brand hex `4285F4`, `34A853` | about.google/brand-resource-center |
| `dropbox.svg` | Dropbox | Simple Icons (CC0), brand hex `0061FF` | dropbox.com/branding |
| `zendesk.svg` | Zendesk | Simple Icons (CC0), brand hex `03363D` (deep) | zendesk.com/company/brand-assets |
| `hubspot.svg` | HubSpot | Simple Icons (CC0), brand hex `FF7A59` | hubspot.com/brand-kit-generator |
| `stripe.svg` | Stripe | Simple Icons (CC0), brand hex `635BFF` | stripe.com/newsroom/brand-assets |
| `sentry.svg` | Sentry | Simple Icons (CC0), brand hex `362D59` (deep) | sentry.io/branding |
| `pagerduty.svg` | PagerDuty | Simple Icons (CC0), brand hex `06AC38` | pagerduty.com/brand |
| `datadog.svg` | Datadog | Simple Icons (CC0), brand hex `632CA6` | datadoghq.com/about/resources |
| `whatsapp.svg` | WhatsApp | Simple Icons (CC0), brand hex `25D366` | whatsappbrand.com |
| `mattermost.svg` | Mattermost | Simple Icons (CC0), brand hex `0058CC` | mattermost.com/brand-guidelines |
| `todoist.svg` | Todoist | Simple Icons (CC0), brand hex `E44332` | todoist.com/press |
| `airtable.svg` | Airtable | Simple Icons (CC0), brand hex `18BFFF` | airtable.com/press |
| `figma.svg` | Figma | Simple Icons (CC0), brand hex `F24E1E` | figma.com/using-the-figma-brand |
| `vercel.svg` | Vercel | Simple Icons (CC0), brand hex `000000` so `currentColor` | vercel.com/design/brands |
| `cloudflare.svg` | Cloudflare | Simple Icons (CC0), brand hex `F38020` | cloudflare.com/press-kit |
| `docker.svg` | Docker | Simple Icons (CC0), brand hex `2496ED` | docker.com/company/newsroom/media-resources |
| `kubernetes.svg` | Kubernetes | Simple Icons (CC0), brand hex `326CE5` | github.com/kubernetes/community/tree/master/logo |
| `postgresql.svg` | PostgreSQL | Simple Icons (CC0), brand hex `4169E1` | postgresql.org/about/policies/trademarks |
| `cursor.svg` | Cursor | Lobe Icons (MIT) | cursor.com |
| `groq.svg` | Groq | Lobe Icons (MIT) | groq.com |
| `deepseek.svg` | DeepSeek | Lobe Icons (MIT), colour variant | deepseek.com |
| `github.svg` | GitHub | Simple Icons (CC0), brand hex `181717` so `currentColor` | github.com/logos |
| `bitbucket.svg`, `jira.svg` | Atlassian | Simple Icons (CC0), brand hex `0052CC` | atlassian.design/resources/logo-library |
| `slack.svg` | Slack | Simple Icons (CC0), brand hex `4A154B` (deep) | slack.com/media-kit |
| `gmail.svg`, `google-calendar.svg` | Google Workspace | Simple Icons (CC0), brand hex `EA4335`, `4285F4` | about.google/brand-resource-center |
| `notion.svg` | Notion | Simple Icons (CC0), brand hex `000000` so `currentColor` | notion.so/brand |
| `telegram.svg` | Telegram | Simple Icons (CC0), brand hex `26A5E4` | telegram.org |
| `discord.svg` | Discord | Simple Icons (CC0), brand hex `5865F2` | discord.com/branding |

The Simple Icons files come from Simple Icons 15.0.0.

The file licences cover the SVG data only. The marks remain their owners' trademarks. Upmo uses them only to name the third-party service (nominative use) and claims no affiliation.

To add a mark:

1. Take the owner's own SVG first, from the site header or the press kit. If there is none, use a Lobe colour variant. If there is none of those, use Simple Icons with its published hex.
2. Remove the `width` and `height` attributes from the `<svg>` element.
3. Apply the set's published brand hex. Never use a colour picked by hand.
4. Work out the relative luminance of that colour. If it is under 0.05, add the `u-brand--deep` class to the `<svg>` element.
5. Add a row to the table above.
6. Check the owner's guidelines for a colour or clear-space rule the table should note.
