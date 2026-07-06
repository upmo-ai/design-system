# Third-party notices

This repository uses work from other projects. This file names each one, says where it is used and gives its licence. The Upmo code and documentation are under the licence in [LICENSE](LICENSE). The licences below cover only the third-party files named here.

The brand marks in `content/assets/brands` and the language marks in `content/assets/languages` (and their copies in `packages/brands`) are trademarks of their owners. The licences below cover the SVG file data only, not the right to use a mark. See [`content/assets/brands/README.md`](content/assets/brands/README.md) for how Upmo uses them. One file, `openrouter.svg`, is the owner's own mark from openrouter.ai and comes from neither icon set below.

## Lobe Icons

- Project: [Lobe Icons](https://github.com/lobehub/lobe-icons) by LobeHub
- Licence: MIT
- Used in: these files in `content/assets/brands`, copied into `packages/brands`:
  `anthropic.svg`, `aws.svg`, `azure.svg`, `bedrock.svg`, `cerebras.svg`, `cohere.svg`, `cursor.svg`, `deepseek.svg`, `fireworks.svg`, `gemini.svg`, `google.svg`, `groq.svg`, `huggingface.svg`, `lmstudio.svg`, `meta.svg`, `mistral.svg`, `moonshot.svg`, `nvidia.svg`, `ollama.svg`, `openai.svg`, `perplexity.svg`, `qwen.svg`, `together.svg`, `vertexai.svg`, `vllm.svg`, `xai.svg`, `zai.svg`

```
MIT License

Copyright (c) 2023 LobeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Simple Icons

- Project: [Simple Icons](https://simpleicons.org) by the Simple Icons contributors
- Licence: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- Release: 15.0.0
- Used in: the files in `content/assets/brands` that the Sources table credits to Simple Icons, and every file in `content/assets/languages`, with their published brand hex. They are copied into `packages/brands`.

CC0 places the SVG data in the public domain, so no notice is required. We name the project to give credit. CC0 does not cover the trademarks the icons show.

Simple Icons records a different licence for four of the language files. These are the licences Simple Icons lists for them:

- `content/assets/languages/javascript.svg` (Simple Icons `javascript`): MIT, from [logo.js](https://github.com/voodootikigod/logo.js).
- `content/assets/languages/bash.svg` (Simple Icons `gnubash`): MIT, from the [official Bash logo](https://github.com/odb/official-bash-logo).
- `content/assets/languages/rust.svg` (Simple Icons `rust`): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), the Rust logo by the Rust Foundation. See the [Rust media guide](https://www.rust-lang.org/policies/media-guide).
- `content/assets/languages/php.svg` (Simple Icons `php`): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), the PHP logo by Colin Viebrock, from [php.net](https://www.php.net/download-logos.php).

Upmo changed these files only by adding the fill colour and the attributes on the `<svg>` element. They stay under their own licences, not under this repository's licence.

## Tabler Icons

- Project: [Tabler Icons](https://tabler.io/icons) by Paweł Kuna
- Licence: MIT, the same text as above, with the line `Copyright (c) 2020-2024 Paweł Kuna`
- Used as: a dependency, not copied into this repository. The docs site depends on `@tabler/icons` and draws its SVGs into the Icons and Languages pages at build time. The IconMap preview loads the Tabler sprite from a CDN. Some component previews include Tabler outline glyphs as inline SVG. Apps install `@tabler/icons-react` themselves.

## Fonts

The fonts are not stored in this repository. The docs site and the previews load them from Google Fonts. All three are under the [SIL Open Font License 1.1](https://openfontlicense.org).

- [Manrope](https://fonts.google.com/specimen/Manrope) by Mikhail Sharanda: the UI face.
- [Familjen Grotesk](https://fonts.google.com/specimen/Familjen+Grotesk) by Familjen STHLM: the display face.
- [Fira Code](https://fonts.google.com/specimen/Fira+Code) by Nikita Prokopov: the code face.
