import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

export interface DsCard {
  group: string;
  height: number;
  width?: number;
  page: boolean;
  subtitle?: string;
}

export interface Component extends DsCard {
  name: string;
  slug: string;
  preview: string;
  readme?: string;
}

const dsCardRe = /^\s*<!--\s*@dsCard\b(.*?)-->/;

// First line of every preview.html: <!-- @dsCard group="Actions" height=230 width=960 page subtitle="..." -->
export function parseDsCard(html: string): DsCard {
  const inner = dsCardRe.exec(html)?.[1] ?? '';
  const attrs: Record<string, string | true> = {};
  for (const m of inner.matchAll(/(\w+)(?:=(?:"([^"]*)"|(\S+)))?/g)) attrs[m[1]] = m[2] ?? m[3] ?? true;
  const num = (v: string | true | undefined) => (typeof v === 'string' ? Number(v) : undefined);
  return {
    group: typeof attrs.group === 'string' ? attrs.group : 'Other',
    height: num(attrs.height) ?? 300,
    width: num(attrs.width),
    page: attrs.page === true,
    subtitle: typeof attrs.subtitle === 'string' ? attrs.subtitle : undefined,
  };
}

export function stripDsCard(html: string): string {
  return html.replace(dsCardRe, '').replace(/^\n/, '');
}

export function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function splitH1(md: string): { title?: string; body: string } {
  const m = /^\s*# (.+)\n+/.exec(md);
  return m ? { title: m[1].trim(), body: md.slice(m[0].length) } : { body: md.replace(/^\s+/, '') };
}

// First paragraph and the rest, for the lead line under a page title.
export function splitLead(body: string): { lead: string; rest: string } {
  const m = /^([\s\S]*?)(?:\n\s*\n|$)/.exec(body.trimStart());
  const lead = m ? m[1].trim() : '';
  return { lead, rest: body.trimStart().slice(m ? m[0].length : 0).trimStart() };
}

// Pull one "## Heading" section out of a document.
export function extractSection(md: string, heading: string): { section: string; rest: string } {
  const start = md.search(new RegExp(`^## ${heading}\\s*$`, 'm'));
  if (start < 0) return { section: '', rest: md };
  const afterHeading = md.indexOf('\n', start) + 1;
  const next = md.slice(afterHeading).search(/^## /m);
  const end = next < 0 ? md.length : afterHeading + next;
  return {
    section: md.slice(afterHeading, end).trim(),
    rest: (md.slice(0, start) + md.slice(end)).replace(/\n{3,}/g, '\n\n'),
  };
}

// Markdown to a one-line plain description for frontmatter.
export function plain(md: string): string {
  return md.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').replace(/\s+/g, ' ').trim();
}

export function firstSentence(text: string): string {
  return /^(.+?[.!?])(\s|$)/.exec(text)?.[1] ?? text;
}

export function page(fields: Record<string, string>, body: string): string {
  const fm = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${fm.join('\n')}\n---\n\n${body.trim()}\n`;
}

export function readComponents(contentDir: URL): Component[] {
  const dir = new URL('components/', contentDir);
  return readdirSync(dir)
    .filter((name) => statSync(new URL(name, dir)).isDirectory())
    .sort()
    .map((name) => {
      const preview = readFileSync(new URL(`${name}/preview.html`, dir), 'utf8');
      const readmeUrl = new URL(`${name}/README.md`, dir);
      return {
        name,
        slug: kebab(name),
        preview,
        readme: existsSync(readmeUrl) ? readFileSync(readmeUrl, 'utf8') : undefined,
        ...parseDsCard(preview),
      };
    });
}

// The released version shown in the site header. The packages release as one fixed group, so they must agree.
export function releaseVersion(packagesDir: URL): string {
  const versions = readdirSync(packagesDir)
    .filter((name) => existsSync(new URL(`${name}/package.json`, packagesDir)))
    .sort()
    .map((name) => ({ name, version: JSON.parse(readFileSync(new URL(`${name}/package.json`, packagesDir), 'utf8')).version as string }));
  const distinct = [...new Set(versions.map((v) => v.version))];
  if (distinct.length !== 1) throw new Error(`Package versions differ: ${versions.map((v) => `${v.name} ${v.version}`).join(', ')}`);
  return distinct[0];
}

// Sidebar groups: alphabetical, Other last; components alphabetical within a group.
export function componentGroups<T extends { name: string; group: string }>(components: T[]) {
  const groups = new Map<string, T[]>();
  for (const c of components) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
  return [...groups.keys()]
    .sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)))
    .map((label) => ({ label, components: groups.get(label)!.sort((a, b) => a.name.localeCompare(b.name)) }));
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const fonts =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Fira+Code:wght@400&display=swap';

// A standalone page for one preview.html body. The theme comes from ?theme= before first paint.
export function previewDocument(opts: { name: string; body: string; tokensCss: string; bundleCss: string }): string {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.name)} preview</title>
<script>(function(){var t=new URLSearchParams(location.search).get('theme');document.documentElement.setAttribute('data-theme',t==='dark'||t==='hc'?t:'light');})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>
${opts.tokensCss}</style>
<style>
${opts.bundleCss}</style>
</head>
<body>
${stripDsCard(opts.body).trim()}
</body>
</html>
`;
}

export const previewPadding = 24;

// The live preview block on a component page; public/previews/<Name>.html is its source.
export function previewBlock(c: Component): string {
  const src = `/previews/${c.name}.html`;
  const seg = (attr: string, label: string, options: [string, string][]) =>
    `<div class="ds-seg" role="group" aria-label="${label}">${options
      .map(([v, text]) => `<button type="button" data-${attr}="${v}" aria-pressed="false">${text}</button>`)
      .join('')}</div>`;
  return [
    `<div class="ds-preview not-content"${c.width ? ` data-width="${c.width}"` : ''}>`,
    `<div class="ds-preview-bar">${seg('theme-choice', 'Preview theme', [
      ['light', 'Light'],
      ['dark', 'Dark'],
      ['hc', 'High contrast'],
    ])}${seg('width-choice', 'Preview width', [
      ['390', 'Phone'],
      ['768', 'Tablet'],
      ['full', 'Full'],
    ])}<a class="ds-preview-open" href="${src}" target="_blank" rel="noopener">Open</a></div>`,
    `<div class="ds-preview-frame"><iframe title="${escapeHtml(c.name)} preview" data-src="${src}" data-min-height="${c.height + previewPadding}" loading="lazy" style="height: ${c.height + previewPadding}px"></iframe></div>`,
    `</div>`,
  ].join('\n');
}

export function componentPage(c: Component): string {
  const { body } = splitH1(c.readme ?? '');
  const { lead, rest } = splitLead(body);
  const description = plain(lead || c.subtitle || c.name);
  return page({ title: c.name, description }, [lead, previewBlock(c), rest].filter(Boolean).join('\n\n'));
}

export function componentIndex(groups: ReturnType<typeof componentGroups<Component>>): string {
  const sections = groups.map(({ label, components }) => {
    const rows = components.map((c) => {
      const lead = splitLead(splitH1(c.readme ?? '').body).lead;
      return [`[${c.name}](/components/${c.slug}/)`, cell(lead || c.subtitle || '')];
    });
    return `## ${label}\n\n${table(['Component', 'What it is'], rows)}`;
  });
  return page(
    { title: 'Components', description: 'Every Upmo component, grouped as in the design system.' },
    `Each page opens with a live HTML reference preview, rendered with the tokens in light, dark and high contrast. The Mantine mapping says which Mantine component each one becomes.\n\n${sections.join('\n\n')}`,
  );
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, ' ');

interface TokenEntry {
  name: string;
  value: string | Record<string, string>;
  usage?: string;
}

export interface TokenSource {
  color: { themes: { id: string; name: string }[]; tokens: TokenEntry[] };
  shadow?: { note?: string; tokens: TokenEntry[] };
  type: {
    groups: {
      name: string;
      family: string;
      styles: { name: string; fontSize: string; lineHeight: string; fontWeight: number; sample?: string; usage?: string }[];
    }[];
  };
  [family: string]: unknown;
}

// Swatches read the token in a theme-scoped element, so the page needs no colour literal.
const swatch = (theme: string, name: string) =>
  `<span class="ds-swatch" data-theme="${theme}" style="background: var(--${name})"></span>`;

const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

export function tokensPage(t: TokenSource, resolved: Record<string, Record<string, string>>): string {
  const themes = t.color.themes;
  const themed = ['Token', ...themes.map((th) => th.name), 'Usage'];
  const out: string[] = [
    'Every value in the system, generated from `tokens.json`. Components read these as CSS variables (`var(--surface-100)`) and never use a literal. Swatches show each theme side by side; the page theme does not change them.',
    '## Colour',
    table(
      themed,
      t.color.tokens.map((tok) => {
        const alias = typeof tok.value === 'string' && tok.value.startsWith('{') ? ` = \`${tok.value.slice(1, -1)}\`` : '';
        const cells = themes.map((th) => `${swatch(th.id, tok.name)} \`${resolved[tok.name][th.id]}\``);
        return [`\`${tok.name}\`${alias}`, ...cells, cell(tok.usage ?? '')];
      }),
    ),
  ];

  if (t.shadow) {
    out.push(
      '## Shadow',
      t.shadow.note ?? '',
      table(
        themed,
        t.shadow.tokens.map((tok) => [
          `\`${tok.name}\``,
          ...themes.map(
            (th) =>
              `<span class="ds-ground" data-theme="${th.id}"><span class="ds-shadow" style="box-shadow: var(--${tok.name})"></span></span>`,
          ),
          cell(tok.usage ?? ''),
        ]),
      ),
    );
  }

  out.push(
    '## Typography',
    table(
      ['Style', 'Sample', 'Size / line', 'Weight', 'Usage'],
      t.type.groups.flatMap((g) =>
        g.styles.map((s) => [
          `\`${s.name}\``,
          `<span class="${s.name}">${escapeHtml(s.sample ?? s.name)}</span>`,
          `${s.fontSize} / ${s.lineHeight}`,
          String(s.fontWeight),
          cell(s.usage ?? ''),
        ]),
      ),
    ),
  );

  const families: [string, string, (name: string) => string][] = [
    ['spacing', 'Spacing', (n) => `<span class="ds-space" style="width: var(--${n})"></span>`],
    ['radius', 'Radius', (n) => `<span class="ds-radius" style="border-radius: var(--${n})"></span>`],
    ['size', 'Size', () => ''],
    ['breakpoint', 'Breakpoints', () => ''],
    ['zIndex', 'Z-index', () => ''],
    ['motion', 'Motion', () => ''],
  ];
  for (const [key, label, sample] of families) {
    const fam = t[key] as { note?: string; tokens: TokenEntry[] } | undefined;
    if (!fam) continue;
    out.push(
      `## ${label}`,
      fam.note ?? '',
      table(
        ['Token', 'Value', 'Usage'],
        fam.tokens.map((tok) => [`\`${tok.name}\``, `${sample(tok.name)} \`${tok.value}\``.trim(), cell(tok.usage ?? '')]),
      ),
    );
  }

  return page(
    { title: 'Colour and tokens', description: 'Every token in tokens.json with its light, dark and high-contrast value and its usage.' },
    out.filter(Boolean).join('\n\n'),
  );
}

export function iconTable(icons: Record<string, string>, render: (name: string) => string | undefined): string {
  const rows = Object.entries(icons).map(([concept, name]) => {
    const svg = render(name);
    return [`\`${concept}\``, svg ? `<span class="ds-icon" data-theme="light">${svg}</span>` : 'missing', `\`${name}\``];
  });
  return `## Every concept\n\nGenerated from \`icons.json\` with the Tabler Icons 3.31 SVGs and the Upmo marks.\n\n${table(['Concept', 'Icon', 'Name'], rows)}`;
}

// One line, sized, decorative: ready to drop into a table cell or grid.
export function inlineSvg(svg: string, size: number, stroke?: number): string {
  let out = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
    .replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
      const kept = attrs.replace(/\s(width|height|class|role|aria-label|aria-hidden)="[^"]*"/g, '');
      return `<svg${kept} width="${size}" height="${size}" aria-hidden="true">`;
    });
  if (stroke !== undefined) out = out.replace(/stroke-width="[^"]*"/, `stroke-width="${stroke}"`);
  return out;
}

export interface BrandEntry {
  id: string;
  file: string;
  deep: boolean;
}

const brandTile = (svg: string, caption: string) =>
  `<figure class="ds-brand"><div class="ds-brand-art"><span data-theme="light">${svg}</span><span class="ds-on-dark" data-theme="dark">${svg}</span></div><figcaption><code>${caption}</code></figcaption></figure>`;

// fallback: an already sized SVG drawn after the marks, captioned with its Tabler name.
export function brandGrid(brands: BrandEntry[], svgFor: (b: BrandEntry) => string, fallback?: { svg: string; name: string }): string {
  const tiles = brands.map((b) =>
    brandTile(inlineSvg(svgFor(b), 32).replace('<svg ', `<svg class="u-brand${b.deep ? ' u-brand--deep' : ''}" `), b.id),
  );
  if (fallback) tiles.push(brandTile(fallback.svg, fallback.name));
  const lead = `Each mark on the light ground (left) and the dark ground (right), at 32px.${fallback ? ` The last tile is the fallback, Tabler \`${fallback.name}\`.` : ''}`;
  return `## All marks\n\n${lead}\n\n<div class="ds-brands not-content">\n${tiles.join('\n')}\n</div>`;
}

// Files on the ground they are made for: names with "dark" or "bone" go on Ink.
export function assetGrid(files: string[], base: string): string {
  const tiles = files.map((f) => {
    const theme = /dark|bone/.test(f) ? 'dark' : 'light';
    return `<figure class="ds-asset"><div class="ds-asset-art" data-theme="${theme}"><img src="${base}/${f}" alt="" loading="lazy"></div><figcaption><a href="${base}/${f}" download><code>${f}</code></a></figcaption></figure>`;
  });
  return `## Files\n\n<div class="ds-assets not-content">\n${tiles.join('\n')}\n</div>`;
}
