# Upmo design system

The design system for [Upmo](https://upmo.ai): tokens, theme, icons, brand
assets, a real React component library, and a documentation site. Upmo runs
always-on AI agents on infrastructure you own. This repo is the single source of
truth the product consumes.

Tagline: Always working. Always yours.

## Packages

| Package | What it is |
| --- | --- |
| `@upmo-ai/tokens` | Design tokens: CSS variables (light / dark / high-contrast) + a typed JS object. No React. |
| `@upmo-ai/theme` | The Mantine 9 theme built from tokens, the CSS-variables resolver that maps Mantine onto Upmo tokens, and the color-scheme wiring. |
| `@upmo-ai/components` | The React component library: themed, accessible Mantine 9 components built on Upmo tokens. |
| `@upmo-ai/icons` | Icon concept map (concept to Tabler Icons name) and the caret mark as SVG. |
| `@upmo-ai/brands` | Marks of the services Upmo connects to, as `currentColor` SVG, with a typed manifest. |

## Apps

| App | What it is |
| --- | --- |
| `apps/storybook` | The component gallery: every component in light, dark and high contrast (`pnpm --filter @upmo-ai/storybook dev`). |
| `apps/docs` | The documentation site, built with Astro Starlight (`pnpm --filter @upmo-ai/docs dev`). |

## Design direction

- A control room for an always-on AI workforce you own: professional, crisp,
  sharp-bordered, dense where data lives, icon + text everywhere.
- Three principles: alive not noisy; autonomy with a hand on the wheel; yours,
  visibly.
- True-neutral grounds (Ramp-like). Emerald is a sparing accent. Borders carry
  structure; shadows lift floating layers only.
- Accessible floor: 4.5:1 body text, 3:1 control edges, keyboard reachable with
  one focus ring, full reduced-motion support.

## Develop

Requires Node >= 24 and pnpm.

```sh
pnpm install
pnpm build          # build every package
pnpm test           # run unit tests
pnpm lint           # hex + glossary + typecheck
```

## Releasing

The five packages share one version, kept in `version.json`. Releases run only
in GitHub Actions; nothing publishes from a laptop.

The **Release** workflow (`.github/workflows/release.yml`) is a "Run workflow"
button on main. It:

1. computes the next version and the changelog from the conventional commits
   since the previous tag, and stops if there is nothing to release;
2. runs the gate: build, lint, test and a pack dry-run of every package;
3. writes the version into every `package.json`, `version.json`, the lockfile
   and `CHANGELOG.md`, commits that to main as a signed (Verified) commit, and
   tags it `vX.Y.Z`;
4. publishes the packages to npm in dependency order (tokens, icons, brands,
   theme, components) with provenance: a stable release under `latest`, a
   prerelease under `next`;
5. creates the GitHub Release with the changelog as its notes, and deploys the
   docs: a stable release to design.upmo.dev, a prerelease to the
   `rc-preview` branch.

### Run a release

1. Actions → Release → Run workflow, on `main`.
2. Pick `bump` (`patch`, `minor`, `major`, or `prepatch`, `preminor`,
   `premajor`, `prerelease` for a release candidate) and keep `preid` as `rc`.
3. Tick `dry_run` first. The job summary shows the version, dist-tag, files and
   changelog, and nothing is written.
4. Run it again without `dry_run` to release.

To check a plan locally: `node scripts/release.ts plan --bump minor`, or
`node scripts/release.ts apply --bump minor --dry-run`.

### If a release fails part-way

- Failed in `prepare` before the commit: nothing was written. Fix the cause and
  run the workflow again.
- Failed in `prepare` after the commit but before the tag: choose **Re-run
  failed jobs** (or run the workflow again). `prepare` checks out the tip of
  main, sees that HEAD is the release commit for the version in `version.json`
  and that its tag is missing, and only creates the tag; it does not bump
  again. The rest of the run then carries on as normal.
- Failed after the commit and tag (in `publish`, `github-release` or `docs`):
  open the run and choose **Re-run failed jobs**. Do not start a new run, which
  would plan the next version instead of finishing this one. Publishing skips any package whose version is
  already on npm, and the GitHub Release step skips a release that exists, so a
  re-run finishes what is left.

### One-time setup

- Create the release GitHub App. `prepare` commits and tags main as this app,
  because main's ruleset requires pull requests and `GITHUB_TOKEN` cannot
  bypass it.
  1. upmo-ai organization Settings → Developer settings → GitHub Apps → New
     GitHub App.
  2. GitHub App name `upmo-design-system-release`, homepage URL
     `https://design.upmo.dev`.
  3. Webhook: untick Active.
  4. Repository permissions → Contents: Read and write. Leave everything else
     at No access.
  5. Where can this GitHub App be installed: Only on this account. Create the
     app.
  6. On the app's page, note the App ID, then Private keys → Generate a
     private key and keep the downloaded `.pem` file.
  7. Install App → upmo-ai → Only select repositories → `design-system` →
     Install.
  8. In this repo, Settings → Secrets and variables → Actions → New repository
     secret: `RELEASE_APP_ID` (the App ID) and `RELEASE_APP_PRIVATE_KEY` (the
     whole `.pem` file). Then delete the local `.pem`.
  9. A maintainer adds the app as a bypass actor: Settings → Rules → Rulesets
     → Protect main → Bypass list → Add bypass →
     `upmo-design-system-release` → Save.
- On npmjs.com, for each of the five packages, Settings → Trusted publishing →
  GitHub Actions: organization `upmo-ai`, repository `design-system`, workflow
  filename `release.yml`, environment `npm`. The publish job runs in the `npm`
  GitHub environment, which GitHub creates on the first run with no
  protection rules. To gate publishing by hand, add a required reviewer to it
  under Settings → Environments → npm.
- Repo secrets: `CLOUDFLARE_API_TOKEN` (a token with Cloudflare Pages edit
  permission) and `CLOUDFLARE_ACCOUNT_ID`.

## Licence

AGPL-3.0-only.

## Community

Licensed under [AGPL-3.0-only](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md)
to get involved, [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for how we work
together, and [SECURITY.md](SECURITY.md) to report a vulnerability.
