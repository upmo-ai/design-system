import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { describeBrand, toModule } from '../scripts/lib.ts';

const assets = new URL('../../../content/assets/brands/', import.meta.url);
const languageAssets = new URL('../../../content/assets/languages/', import.meta.url);
const read = (file: string) => describeBrand(file, readFileSync(new URL(file, assets), 'utf8'));
const readLanguage = (file: string) => describeBrand(file, readFileSync(new URL(file, languageAssets), 'utf8'), 'languages/');
const svgs = (dir: URL) => readdirSync(dir).filter((f) => f.endsWith('.svg'));

describe('describeBrand', () => {
  it('flags deep marks from the u-brand--deep class', () => {
    expect(read('slack.svg')).toEqual({ id: 'slack', file: 'slack.svg', deep: true, currentColor: false });
  });

  it('flags single-ink marks that draw in currentColor', () => {
    expect(read('openai.svg')).toMatchObject({ deep: false, currentColor: true });
  });

  it('does not flag a mark that only sets currentColor as a default under fixed colours', () => {
    expect(read('gemini.svg').currentColor).toBe(false);
    expect(read('google.svg').currentColor).toBe(false);
  });

  it('matches the deep list in content/assets/brands/README.md', () => {
    const files = svgs(assets);
    const deep = files.map(read).filter((b) => b.deep).map((b) => b.id).sort();
    expect(deep).toEqual(['confluence', 'sentry', 'slack', 'zendesk']);
    expect(files).toHaveLength(61);
  });

  it('prefixes the file with the folder it is published in', () => {
    expect(readLanguage('go.svg')).toEqual({ id: 'go', file: 'languages/go.svg', deep: false, currentColor: false });
  });
});

describe('language marks', () => {
  const files = svgs(languageAssets);
  const readme = readFileSync(new URL('README.md', languageAssets), 'utf8');

  it('ships the languages in content/assets/languages/README.md', () => {
    expect(files.map((f) => f.replace(/\.svg$/, '')).sort()).toEqual(
      ['bash', 'css', 'docker', 'go', 'html', 'javascript', 'markdown', 'php', 'python', 'rust', 'typescript', 'yaml'],
    );
    for (const f of files) expect(readme).toContain(`\`${f}\``);
  });

  it('draws black marks in currentColor and has no deep marks', () => {
    const marks = files.map(readLanguage);
    expect(marks.filter((m) => m.currentColor).map((m) => m.id).sort()).toEqual(['markdown', 'rust']);
    expect(marks.filter((m) => m.deep)).toEqual([]);
  });

  it('keeps only path data, hidden from assistive tech', () => {
    for (const f of files) {
      const svg = readFileSync(new URL(f, languageAssets), 'utf8');
      expect(svg).toMatch(/^<svg aria-hidden="true" class="u-brand" data-language="[a-z]+" fill="[^"]+" viewBox="0 0 24 24" xmlns="http:\/\/www.w3.org\/2000\/svg"><path d="[^"]+"\/><\/svg>\n$/);
    }
  });
});

describe('toModule', () => {
  it('types brand and language ids as unions', () => {
    const { js, dts } = toModule({ brands: [read('slack.svg'), read('openai.svg')], languages: [readLanguage('go.svg')] });
    expect(dts).toContain('export type BrandId = "slack" | "openai";');
    expect(dts).toContain('export type LanguageId = "go";');
    expect(dts).toContain('export declare const languages: readonly Language[];');
    expect(js).toContain('"id": "slack"');
    expect(js).toContain('"file": "languages/go.svg"');
  });
});
