import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkMark, checkSource, describeBrand, type Source, toMark } from '../scripts/lib.ts';

const svg = (body: string, attrs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true"${attrs}>${body}</svg>`;

describe('checkMark', () => {
  it('accepts a clean mark with prefixed ids', () => {
    const mark = svg(
      '<defs><linearGradient id="acme-a"><stop offset="0" stop-color="#f00"/></linearGradient></defs>' +
        '<path fill="url(#acme-a)" d="M0 0h48v48H0z"/>',
    );
    expect(checkMark('acme', mark)).toEqual([]);
  });

  it('rejects markup that would leak or run when inlined', () => {
    const mark = svg(
      '<style>.a{fill:red}</style><script>alert(1)</script><image href="https://x.test/a.png"/>' +
        '<path class="a" style="fill:red" onclick="x()" id="a" fill="url(#a)" d="M0 0"/>',
    );
    const errors = checkMark('acme', mark).join('\n');
    for (const problem of ['<style>', '<script>', '<image>', 'event handler', 'style attribute', 'class "a"', 'id "a"', 'href', 'url(#a)']) {
      expect(errors).toContain(problem);
    }
  });

  it('needs a viewBox and aria-hidden, and no fixed size', () => {
    const errors = checkMark('acme', '<svg width="24" height="24"><path d="M0 0"/></svg>');
    expect(errors).toEqual(
      expect.arrayContaining([
        'root <svg> needs a viewBox',
        'root <svg> needs aria-hidden="true"',
        'root <svg> must not set width or height',
      ]),
    );
  });
});

describe('checkSource', () => {
  it('requires every provenance field', () => {
    expect(checkSource(undefined)).toEqual(['no entry in sources/*.json']);
    expect(checkSource({ name: 'Acme', kind: 'connector' })).toEqual([
      'source is missing "source"',
      'source is missing "official"',
      'source is missing "variant"',
    ]);
  });
});

describe('describeBrand', () => {
  it('treats a single near-black mark as deep and a black-and-white tile as colourful', () => {
    expect(describeBrand('a.svg', svg('<path fill="#000" d="M0 0"/>')).deep).toBe(true);
    expect(describeBrand('a.svg', svg('<path fill="#fff" d="M0 0"/><path fill="#000" d="M1 1"/>')).deep).toBe(false);
    expect(describeBrand('a.svg', svg('<path fill="#E01E5A" d="M0 0"/>')).deep).toBe(false);
  });
});

describe('toMark', () => {
  it('nests the mark with its own viewBox so any official size scales to the box', () => {
    const file = svg('<path fill="#E01E5A" d="M0 0"/>');
    expect(toMark(file, describeBrand('a.svg', file))).toBe(
      '<svg viewBox="0 0 48 48" width="24" height="24"><path fill="#E01E5A" d="M0 0"/></svg>',
    );
  });

  it('inks only the near-black parts of a deep mark, keeping its brand colour', () => {
    const file = svg('<path fill="#232F3E" d="M0 0"/><path fill="#FF9900" d="M1 1"/>', ' class="u-brand--deep"');
    const mark = toMark(file, describeBrand('aws.svg', file));
    expect(mark).toContain('<path fill="currentColor" d="M0 0"/>');
    expect(mark).toContain('<path fill="#FF9900" d="M1 1"/>');
    expect(mark).toMatch(/^<svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">/);
  });
});

describe('the shipped marks', () => {
  const root = new URL('../', import.meta.url);
  const sources: Record<string, Source> = {};
  for (const file of readdirSync(new URL('sources/', root)).filter((f) => f.endsWith('.json'))) {
    Object.assign(sources, JSON.parse(readFileSync(new URL(`sources/${file}`, root), 'utf8')));
  }
  const files = readdirSync(new URL('assets/brands/', root)).filter((f) => f.endsWith('.svg'));

  it.each(files)('%s is safe to inline and traced to an official source', (file) => {
    const id = file.replace(/\.svg$/, '');
    const mark = readFileSync(new URL(`assets/brands/${file}`, root), 'utf8');
    expect([...checkMark(id, mark), ...checkSource(sources[id])]).toEqual([]);
  });

  it('has no source entry without a mark', () => {
    const ids = new Set(files.map((f) => f.replace(/\.svg$/, '')));
    expect(Object.keys(sources).filter((id) => !ids.has(id))).toEqual([]);
  });
});
