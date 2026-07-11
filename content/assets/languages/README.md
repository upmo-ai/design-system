# Languages

These are the marks of programming languages and file formats. They appear in one place only: the header of a `CodeBlock`, at 16px, always next to the language name in words. The name is what people read. The mark helps them spot the language at a glance.

## Rules

- The rules for brand marks apply here too: official artwork from Simple Icons, the published brand hex, never reshaped or recoloured. See the Brands page.
- Marks with a black published colour (Markdown, Rust) ship with `fill="currentColor"` and take the header text colour. No mark here has a dark colour under 0.05 relative luminance, so none carries `u-brand--deep`. The rule still holds for any mark added later.
- JavaScript is a light yellow. It keeps its published hex. The mark is decorative and the name beside it carries the meaning.
- Every mark is `aria-hidden`. The language name beside it is the accessible label.
- A language with no mark here uses the Tabler `file-code` outline icon in `currentColor`, at the same 16px. That covers Java, SQL, plain text, diff and anything else. Java has no mark because Simple Icons removed it at Oracle's request. JSON uses the Tabler `braces` icon. Simple Icons has the json.org logo, but people know JSON as `{ }`, so the familiar sign wins.

## Sources

All files come from Simple Icons 15.0.0, the same release as the Simple Icons marks on the Brands page.

| File | Language | Source, licence of the file | Brand guidelines |
| --- | --- | --- | --- |
| `go.svg` | Go | Simple Icons `go` (CC0), brand hex `00ADD8` | go.dev/blog/go-brand |
| `python.svg` | Python | Simple Icons `python` (CC0), brand hex `3776AB` | python.org/community/logos |
| `typescript.svg` | TypeScript | Simple Icons `typescript` (CC0), brand hex `3178C6` | typescriptlang.org/branding |
| `javascript.svg` | JavaScript | Simple Icons `javascript` (MIT, per Simple Icons), brand hex `F7DF1E` | github.com/voodootikigod/logo.js |
| `rust.svg` | Rust | Simple Icons `rust` (CC BY-SA 4.0, per Simple Icons), brand hex `000000` so `currentColor` | rust-lang.org/policies/media-guide |
| `bash.svg` | Bash | Simple Icons `gnubash` (MIT, per Simple Icons), brand hex `4EAA25` | github.com/odb/official-bash-logo |
| `docker.svg` | Dockerfile | Simple Icons `docker` (CC0), brand hex `2496ED` | docker.com/company/newsroom/media-resources |
| `yaml.svg` | YAML | Simple Icons `yaml` (CC0), brand hex `CB171E` | yaml.org |
| `html.svg` | HTML | Simple Icons `html5` (CC0), brand hex `E34F26` | w3.org/html/logo |
| `css.svg` | CSS | Simple Icons `css` (CC0), brand hex `663399` | github.com/CSS-Next/logo.css |
| `markdown.svg` | Markdown | Simple Icons `markdown` (CC0), brand hex `000000` so `currentColor` | github.com/dcurtis/markdown-mark |
| `php.svg` | PHP | Simple Icons `php` (CC BY-SA 4.0, per Simple Icons), brand hex `777BB4` | php.net/download-logos.php |

Simple Icons is CC0, but it records a different licence for a few icons. Those are named in the table and in `THIRD_PARTY_NOTICES.md`. The marks remain their owners' trademarks.

To add a mark, follow the steps on the Brands page, with two changes. Name the file after the language as people write it in a code fence (`bash`, `html`), not after the Simple Icons slug. Put `data-language` on the `<svg>` element in place of `data-brand`.
