// Generates the docs pages (src/content/docs) and the preview and asset files (public) from content/ and the packages.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { color } from '@upmo-ai/tokens';
import { icons } from '@upmo-ai/icons';
import {
  assetGrid,
  brandGrid,
  componentGroups,
  componentIndex,
  componentPage,
  extractSection,
  firstSentence,
  iconTable,
  inlineSvg,
  page,
  plain,
  previewDocument,
  readComponents,
  splitH1,
  splitLead,
  tokensPage,
  type BrandEntry,
} from './lib.ts';

const app = new URL('../', import.meta.url);
const repo = new URL('../../', app);
const content = new URL('content/', repo);
const assets = new URL('assets/', content);
const docsOut = new URL('src/content/docs/', app);
const publicOut = new URL('public/', app);

const read = (url: URL) => readFileSync(url, 'utf8');
// Node's cpSync returns EACCES on the Docker file mount. cp does not.
const copyDir = (src: URL, dest: URL) => {
  mkdirSync(dest, { recursive: true });
  execFileSync('cp', ['-a', `${fileURLToPath(src)}/.`, fileURLToPath(dest)]);
};
const fromPackage = (spec: string) => new URL(import.meta.resolve(spec));
const tryRead = (spec: string) => {
  try {
    return read(fromPackage(spec));
  } catch {
    return undefined;
  }
};
let pages = 0;
const write = (path: string, text: string) => {
  const url = new URL(path, docsOut);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, text);
  pages++;
};
const describe = (body: string) => firstSentence(plain(splitLead(body).lead));

// A content markdown file as a page: its H1 becomes the title, its first sentence the description.
const contentPage = (file: string, title?: string) => {
  const { title: h1, body } = splitH1(read(new URL(file, content)));
  return page({ title: title ?? h1 ?? file, description: describe(body) }, body);
};

rmSync(docsOut, { recursive: true, force: true });
rmSync(publicOut, { recursive: true, force: true });
copyDir(new URL('src/handwritten/', app), docsOut);

// Getting started
const { section: principles, rest: overview } = extractSection(read(new URL('README.md', content)), 'Principles');
write('getting-started/overview.md', page({ title: 'Overview', description: describe(overview) }, overview));
write(
  'getting-started/principles.md',
  page({ title: 'Principles', description: 'The principles every Upmo component, page and marketing surface follows.' }, principles),
);
write('getting-started/mantine.md', contentPage('mantine.md', 'Mantine mapping'));
write(
  'getting-started/changelog.md',
  page({ title: 'Changelog', description: 'Releases of the Upmo design system packages.' }, splitH1(read(new URL('CHANGELOG.md', repo))).body),
);

// Foundations
write('foundations/tokens.md', tokensPage(JSON.parse(read(fromPackage('@upmo-ai/tokens/tokens.json'))), color));
for (const name of ['contrast', 'responsive', 'motion', 'accessibility', 'dataviz']) {
  write(`foundations/${name}.md`, contentPage(`${name}.md`));
}
const missingIcons: string[] = [];
const renderIcon = (name: string) => {
  const mark = name === 'caret' || name.startsWith('status-');
  const svg = mark ? tryRead(`@upmo-ai/icons/svg/${name}.svg`) : tryRead(`@tabler/icons/outline/${name}.svg`);
  if (!svg) missingIcons.push(name);
  return svg && inlineSvg(svg, 20, mark ? undefined : 1.75);
};
const iconsDoc = splitH1(read(new URL('icons.md', content)));
write(
  'foundations/icons.md',
  page({ title: iconsDoc.title ?? 'Icons', description: describe(iconsDoc.body) }, `${iconsDoc.body}\n\n${iconTable(icons, renderIcon)}`),
);

// Content and patterns
write('content/glossary.md', contentPage('glossary.md'));
write('content/microcopy.md', contentPage('microcopy.md'));
write('content/marketing.md', contentPage('marketing.md'));
write('patterns/index.md', contentPage('patterns.md'));
write('patterns/forms.md', contentPage('forms.md'));

// Components and their previews
const tokensCss = read(fromPackage('@upmo-ai/tokens/tokens.css'));
const bundleCss = read(new URL('components/bundle.css', content));
const components = readComponents(content);
mkdirSync(new URL('previews/', publicOut), { recursive: true });
for (const c of components) {
  writeFileSync(new URL(`previews/${c.name}.html`, publicOut), previewDocument({ name: c.name, body: c.preview, tokensCss, bundleCss }));
  write(`components/${c.slug}.md`, componentPage(c));
}
write('components/index.md', componentIndex(componentGroups(components)));

// Brand
const assetOut = new URL('assets/', publicOut);
copyDir(assets, assetOut);
execFileSync('find', [fileURLToPath(assetOut), '-name', '*.md', '-delete']);
copyFileSync(new URL('icons/caret.svg', assets), new URL('favicon.svg', publicOut));
const files = (dir: string) => readdirSync(new URL(`${dir}/`, assets)).filter((f) => !f.endsWith('.md')).sort();
const brandPage = (dir: string, title: string, extra: string) => {
  const { body } = splitH1(read(new URL(`${dir}/README.md`, assets)));
  return page({ title, description: describe(body) }, `${body}\n\n${extra}`);
};
const { brands, languages }: { brands: BrandEntry[]; languages: BrandEntry[] } = JSON.parse(read(fromPackage('@upmo-ai/brands/brands.json')));
const markSvg = (b: BrandEntry) => read(fromPackage(`@upmo-ai/brands/svg/${b.file}`));
write('brand/logos.md', brandPage('logos', 'Logos', assetGrid(files('logos'), '/assets/logos')));
write('brand/icons.md', brandPage('icons', 'Icon marks', assetGrid(files('icons'), '/assets/icons')));
write('brand/brands.md', brandPage('brands', 'Brands', brandGrid(brands, markSvg)));
const fileCode = tryRead('@tabler/icons/outline/file-code.svg');
if (!fileCode) missingIcons.push('file-code');
write(
  'brand/languages.md',
  brandPage('languages', 'Languages', brandGrid(languages, markSvg, fileCode ? { svg: inlineSvg(fileCode, 32, 1.75), name: 'file-code' } : undefined)),
);
write('brand/exports.md', brandPage('exports', 'Exports', assetGrid(files('exports'), '/assets/exports')));

if (missingIcons.length) console.warn(`gen: no SVG for icons ${[...new Set(missingIcons)].join(', ')}`);
console.log(`gen: ${pages} pages, ${components.length} previews`);
