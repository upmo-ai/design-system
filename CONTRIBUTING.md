# Contributing

Thanks for helping. This file covers how to work on the repository and what a pull request needs.

## Before you start

- Sign the [Contributor License Agreement](CLA.md). CLA Assistant asks you once, on your first pull request. You keep the copyright in your work; the agreement lets the maintainer ship it under the AGPL and in the hosted Upmo service.

## Development runs in Docker

Do not install Node or pnpm on your machine for this repository. `compose.yml` has a `dev` service with Node 24 and pnpm (through corepack), the repository mounted at `/app` and port 4321 published.

```sh
docker compose run --rm dev pnpm install
docker compose run --rm --service-ports dev pnpm dev    # docs site at http://localhost:4321
docker compose run --rm dev pnpm build
docker compose run --rm dev pnpm test
docker compose run --rm dev pnpm lint
```

Run `build`, `test` and `lint` before you open a pull request; CI runs the same three.

## How content and previews work

`content/` is the source of truth. Edit it there, not in `apps/docs`.

- `content/*.md`: one page per topic (accessibility, forms, motion and so on).
- `content/components/<Name>/README.md`: the component page. The first paragraph after the H1 is its one-line description.
- `content/components/<Name>/preview.html`: an HTML fragment styled with `content/components/bundle.css` and the tokens. Its first line is a comment such as `<!-- @dsCard group="Actions" height=230 subtitle="..." -->`. `group` places the component in the sidebar, `height` and the optional `width` size the preview frame, and `page` marks a full-page example.
- `content/assets/`: logos, icons, brand marks and raster exports, each folder with a README.
- `packages/tokens/tokens.json` and `packages/icons/icons.json`: the token and icon sources.

`pnpm gen` (part of `pnpm dev` and `pnpm build`) runs `apps/docs/scripts/gen.ts`. It writes the Starlight pages into `apps/docs/src/content/docs/` and one standalone preview page per component into `apps/docs/public/previews/`. Both folders are generated and ignored by git. Hand-written pages (the landing page and Install) live in `apps/docs/src/handwritten/` and are copied in.

Colours come from tokens only. `pnpm lint` fails on a raw hex colour in `content/components/bundle.css` or `apps/docs/src`.

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org): `<type>[optional scope]: <description>`, with types `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`. Subject in lower case, 72 characters at most, no trailing period. The body says why.
- The CLA covers your rights in the contribution, so a `Signed-off-by` line is not needed.

## Changesets

A change to a published package (`packages/*`) needs a changeset:

```sh
docker compose run --rm dev pnpm changeset
```

Pick the packages, the bump (patch, minor, major) and write one line for the changelog. Commit the generated file in `.changeset/` with your change. Changes to `content/` or the docs site alone do not need one.

## Writing style

Follow the rules in `content/README.md` and `content/microcopy.md`: plain, direct sentences, sentence case, no em dashes, no emoji.
