# Upmo Design System

The tokens, components and rules behind every Upmo screen. Upmo runs always-on AI agents, on the managed service at [upmo.ai](https://upmo.ai) or self-hosted from [upmo.dev](https://upmo.dev). This repository holds the design system both use and its documentation site, [design.upmo.dev](https://design.upmo.dev).

The base library is [Mantine 9](https://mantine.dev); icons are [Tabler Icons 3](https://tabler.io/icons). Upmo components are Mantine components themed with these tokens, extended only where Upmo needs something Mantine does not have (the caret, task status).

## Packages

| Package                              | What it holds                                                                                    |
|--------------------------------------|--------------------------------------------------------------------------------------------------|
| [`@upmo-ai/tokens`](packages/tokens) | `tokens.json`, built into `tokens.css` (light, dark and high-contrast themes) and a typed object |
| [`@upmo-ai/ui`](packages/ui)         | The Mantine theme built from the tokens. No components yet.                                      |
| [`@upmo-ai/icons`](packages/icons)   | The concept map from interface concepts to Tabler names, and the caret and status SVGs           |
| [`@upmo-ai/brands`](packages/brands) | Marks of the services Upmo connects to, as SVG, with a manifest                                  |
| [`apps/docs`](apps/docs)             | The documentation site (Astro and Starlight)                                                     |

The written rules live in `content/`: one Markdown file per topic, a `README.md` and an HTML reference preview per component, and the logo, icon and brand assets. The site is generated from them.

## Quick start

Everything runs in Docker; nothing needs Node on the host.

```sh
docker compose run --rm dev pnpm install
docker compose run --rm --service-ports dev pnpm dev
```

The site is then at http://localhost:4321. Other commands run the same way:

```sh
docker compose run --rm dev pnpm build   # packages, then the generated docs pages, then the site
docker compose run --rm dev pnpm test
docker compose run --rm dev pnpm lint
```

## Licence

Code and documentation are under the [GNU Affero General Public License v3.0](LICENSE). The Upmo name, caret mark and wordmark are not; see [TRADEMARK.md](TRADEMARK.md). Third-party marks in `packages/brands` belong to their owners.

Third-party icons and fonts, with their licences, are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).
