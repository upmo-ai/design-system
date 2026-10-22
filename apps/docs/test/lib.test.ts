import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  brandGrid,
  componentGroups,
  componentPage,
  extractSection,
  inlineSvg,
  kebab,
  parseDsCard,
  previewDocument,
  readComponents,
  releaseVersion,
  splitH1,
  splitLead,
  tokensPage,
  type Component,
} from '../scripts/lib.ts';

const content = new URL('../../../content/', import.meta.url);
const components = readComponents(content);
const byName = (name: string) => components.find((c) => c.name === name)!;

describe('parseDsCard', () => {
  it('reads group, height, width, page and subtitle', () => {
    expect(parseDsCard('<!-- @dsCard group="Inputs" height=420 width=960 page subtitle="Pick one: a = b" -->\n<div></div>')).toEqual({
      group: 'Inputs',
      height: 420,
      width: 960,
      page: true,
      subtitle: 'Pick one: a = b',
    });
  });

  it('falls back to Other when there is no group', () => {
    expect(parseDsCard('<!-- @dsCard height=300 -->')).toMatchObject({ group: 'Other', height: 300, page: false });
  });

  it('parses every preview in content/components', () => {
    expect(components.length).toBeGreaterThan(60);
    expect(byName('Button')).toMatchObject({ group: 'Actions', height: 230, width: undefined, slug: 'button' });
    expect(byName('PageChat')).toMatchObject({ group: 'Pages', width: 1280, page: true });
    for (const c of components) expect(c.height).toBeGreaterThan(0);
  });
});

describe('markdown helpers', () => {
  it('turns component names into URL slugs', () => {
    expect(kebab('ActionIcon')).toBe('action-icon');
    expect(kebab('PageTaskDetail')).toBe('page-task-detail');
    expect(kebab('Kbd')).toBe('kbd');
  });

  it('splits the H1 from the body', () => {
    expect(splitH1('# Button\n\nThe control.\n\n## When\n')).toEqual({ title: 'Button', body: 'The control.\n\n## When\n' });
    expect(splitH1('No heading here.')).toEqual({ body: 'No heading here.' });
  });

  it('splits the lead paragraph from the rest', () => {
    expect(splitLead('First line\nstill first.\n\n## Next\n\nMore.')).toEqual({ lead: 'First line\nstill first.', rest: '## Next\n\nMore.' });
  });

  it('extracts the Principles section from the README', () => {
    const readme = readFileSync(new URL('README.md', content), 'utf8');
    const { section, rest } = extractSection(readme, 'Principles');
    expect(section.startsWith('1. **Up is the only metaphor.**')).toBe(true);
    expect(rest).not.toContain('## Principles');
    expect(rest).toContain('## Content');
  });
});

describe('releaseVersion', () => {
  const fixture = (versions: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), 'upmo-packages-'));
    for (const [name, version] of Object.entries(versions)) {
      mkdirSync(join(dir, name));
      writeFileSync(join(dir, name, 'package.json'), JSON.stringify({ name: `@upmo-ai/${name}`, version }));
    }
    return pathToFileURL(`${dir}/`);
  };

  it('returns the one version the packages share', () => {
    expect(releaseVersion(fixture({ tokens: '0.4.0', ui: '0.4.0' }))).toBe('0.4.0');
  });

  it('throws when the packages disagree', () => {
    expect(() => releaseVersion(fixture({ tokens: '0.4.0', ui: '0.3.0' }))).toThrow('Package versions differ: tokens 0.4.0, ui 0.3.0');
  });

  it('reads the version of the packages in this repository', () => {
    const tokens = JSON.parse(readFileSync(new URL('../../../packages/tokens/package.json', import.meta.url), 'utf8'));
    expect(releaseVersion(new URL('../../../packages/', import.meta.url))).toBe(tokens.version);
  });
});

describe('componentGroups', () => {
  it('sorts groups alphabetically with Other last, and names within a group', () => {
    const groups = componentGroups([
      { name: 'Zed', group: 'Data' },
      { name: 'Extra', group: 'Other' },
      { name: 'Alpha', group: 'Data' },
      { name: 'Button', group: 'Actions' },
      { name: 'Toast', group: 'Status' },
    ]);
    expect(groups.map((g) => g.label)).toEqual(['Actions', 'Data', 'Status', 'Other']);
    expect(groups[1].components.map((c) => c.name)).toEqual(['Alpha', 'Zed']);
  });
});

describe('previewDocument', () => {
  const html = previewDocument({ name: 'Button', body: byName('Button').preview, tokensCss: '/* tokens */\n', bundleCss: '/* bundle */\n' });

  it('sets the theme from the query before paint and inlines both stylesheets', () => {
    expect(html.indexOf("get('theme')")).toBeLessThan(html.indexOf('<body>'));
    expect(html).toContain('/* tokens */');
    expect(html).toContain('/* bundle */');
    expect(html).toContain('family=Manrope');
    expect(html).toContain('family=Fira+Code');
  });

  it('keeps the preview body and its script, without the dsCard comment', () => {
    expect(html).not.toContain('@dsCard');
    expect(html).toContain("document.querySelectorAll('[data-demo]')");
  });

  it('escapes quotes and markup in the name', () => {
    const named = previewDocument({ name: `<b>"O'Neil"</b>`, body: '', tokensCss: '', bundleCss: '' });
    expect(named).toContain('<title>&lt;b&gt;&quot;O&#39;Neil&quot;&lt;/b&gt; preview</title>');
  });
});

describe('componentPage', () => {
  it('puts the README one-liner first, then the preview, then the rest without the H1', () => {
    const md = componentPage(byName('Button'));
    expect(md).toContain('title: "Button"');
    expect(md).toContain('description: "A button reacts the moment you press it, and its label names the action it runs."');
    expect(md).not.toContain('# Button\n');
    const lead = md.indexOf('A button reacts the moment');
    const preview = md.indexOf('class="ds-preview');
    const rest = md.indexOf('## When to use');
    expect(lead).toBeLessThan(preview);
    expect(preview).toBeLessThan(rest);
    expect(md).toContain('data-src="/previews/Button.html"');
    expect(md).toContain('data-min-height="254"');
    expect(md).toContain('height: 254px');
  });

  it('sets the full width from the dsCard width and falls back to the subtitle without a README', () => {
    const c: Component = { name: 'Wide', slug: 'wide', preview: '', group: 'Other', height: 100, width: 1280, page: false, subtitle: 'Wide one' };
    const md = componentPage(c);
    expect(md).toContain('data-width="1280"');
    expect(md).toContain('description: "Wide one"');
  });
});

describe('tokensPage', () => {
  it('lists every colour token with a swatch per theme and no colour literal in the swatch', () => {
    const tokens = JSON.parse(readFileSync(new URL('../../../packages/tokens/tokens.json', import.meta.url), 'utf8'));
    const resolved = { 'surface-000': { light: '#f2f0ea', dark: '#141a17', hc: '#ffffff' } };
    const md = tokensPage({ ...tokens, color: { ...tokens.color, tokens: [tokens.color.tokens[0]] } }, resolved);
    expect(md).toContain('| Token | Light | Dark | High contrast | Usage |');
    expect(md).toContain('<span class="ds-swatch" data-theme="dark" style="background: var(--surface-000)"></span> `#141a17`');
    expect(md).toContain('## Spacing');
    expect(md).toContain('<span class="h1">Tasks</span>');
  });
});

describe('inlineSvg and brandGrid', () => {
  it('sizes an SVG, hides it from assistive tech and keeps it on one line', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke-width="2" class="x">\n  <path d="M0 0"/>\n</svg>';
    expect(inlineSvg(svg, 20, 1.75)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="1.75" width="20" height="20" aria-hidden="true"><path d="M0 0"/></svg>',
    );
  });

  it('shows each mark on both grounds and marks deep ones for the dark ground rule', () => {
    const md = brandGrid([{ id: 'slack', file: 'slack.svg', deep: true }], () => '<svg class="u-brand u-brand--deep" fill="#4A154B"><path/></svg>');
    expect(md).toContain('<span data-theme="light"><svg class="u-brand u-brand--deep"');
    expect(md).toContain('<span class="ds-on-dark" data-theme="dark">');
    expect(md).toContain('<code>slack</code>');
  });

  it('adds a fallback tile after the marks when one is given', () => {
    const md = brandGrid([{ id: 'go', file: 'languages/go.svg', deep: false }], () => '<svg fill="#00ADD8"><path/></svg>', {
      svg: '<svg class="fb"></svg>',
      name: 'file-code',
    });
    expect(md).toContain('The last tile is the fallback, Tabler `file-code`.');
    expect(md.indexOf('<code>go</code>')).toBeLessThan(md.indexOf('<svg class="fb"></svg>'));
    expect(md).toContain('<code>file-code</code>');
  });
});
