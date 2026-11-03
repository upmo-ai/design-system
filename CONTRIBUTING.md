# Contributing

Thanks for helping with the Upmo design system. By taking part you agree to the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Project layout

| Path | What it is |
| --- | --- |
| `packages/tokens` | Design tokens as CSS variables and a typed object. |
| `packages/theme` | The Mantine theme built from the tokens. |
| `packages/components` | The React component library. |
| `packages/icons` | The icon concept map and the caret mark. |
| `packages/brands` | Service marks as `currentColor` SVG. |
| `apps/docs` | The documentation site. |
| `apps/storybook` | The component gallery. |

## Development setup

Everything runs in Docker; you need no local Node or pnpm. From the repo root:

```sh
docker run --rm -v "$PWD":/w -w /w node:24.22.1 sh -c \
  "corepack enable && pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build"
```

Run Storybook with a published port:

```sh
docker run --rm -p 6006:6006 -v "$PWD":/w -w /w node:24.22.1 sh -c \
  "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @upmo-ai/storybook dev --host 0.0.0.0"
```

Run the docs site the same way:

```sh
docker run --rm -p 4321:4321 -v "$PWD":/w -w /w node:24.22.1 sh -c \
  "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @upmo-ai/docs dev --host 0.0.0.0"
```

## Rules of the repo

- Components read token variables only. No raw hex colours and no raw font
  sizes; the `scripts/check-*.ts` checks run in `pnpm lint` and enforce this.
- Write copy in sentence case, and use no emoji.
- Keep components accessible: meet WCAG contrast, make every control reachable
  by keyboard, and honour reduced motion.
- Existing icon keys never change. Add new keys instead.
- Every new component ships with tests, a Storybook story and documentation.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):
`type(scope): subject`. The subject is lowercase, has no trailing period and is
at most 72 characters. The changelog and GitHub release notes are generated
from commit subjects, so write them for readers.

Mark a breaking change with `!` after the type or scope, or with a
`BREAKING CHANGE:` footer.

## Proposing a change

1. For a large change, open an issue first so we can agree on the approach.
2. Create a branch and make your change.
3. Open a pull request with a summary and how you tested it.
4. CI must pass. Signed commits are welcome.

Maintainers publish releases; contributors never do.

## License

Contributions are licensed under [AGPL-3.0-only](LICENSE). There is no CLA.

## Security

Report vulnerabilities as described in [SECURITY.md](SECURITY.md), never in a
public issue.

## Questions

Ask in a GitHub issue or discussion, or email
[contact@upmo.ai](mailto:contact@upmo.ai).
