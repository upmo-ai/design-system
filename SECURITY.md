# Security policy

## Supported versions

The latest minor release of the current major version (1.x) receives security
fixes. Older versions do not.

## Reporting a vulnerability

Do not open a public issue for a vulnerability.

- Preferred: use GitHub's private vulnerability reporting. Open the repository's
  Security tab and choose "Report a vulnerability".
- Alternative: email [contact@upmo.ai](mailto:contact@upmo.ai).

### What to include

- A description of the vulnerability.
- The affected package and version.
- Steps to reproduce it.
- The impact, as you understand it.

## What to expect

- We acknowledge your report within 3 business days.
- We share an assessment and a plan within 10 business days.
- We disclose in coordination with you after a fix is published.

## Scope

In scope:

- The six npm packages: `@upmo-ai/tokens`, `@upmo-ai/theme`,
  `@upmo-ai/components`, `@upmo-ai/icons`, `@upmo-ai/brands` and
  `@upmo-ai/brand`.
- The documentation site at [design.upmo.dev](https://design.upmo.dev).

Supply-chain integrity matters here: releases are published from GitHub Actions
with npm provenance, so each published version can be traced back to its source
commit. Report anything that suggests a tampered or unexpected release.
