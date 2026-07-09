import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isUpmoMark, readMap, toModule, upmoMarks } from '../scripts/lib.ts';

const json = JSON.parse(readFileSync(new URL('../icons.json', import.meta.url), 'utf8'));
const assets = new URL('../../../content/assets/icons/', import.meta.url);

describe('readMap', () => {
  const map = readMap(json);

  it('separates metadata from concept keys', () => {
    expect(map.set).toBe('@tabler/icons 3.31');
    expect(map.stroke).toBe(1.75);
    expect(map.icons).not.toHaveProperty('$comment');
    expect(map.icons['nav.tasks']).toBe('list-check');
  });

  it('names the delivery concept with the glossary word', () => {
    expect(map.icons['object.delivery']).toBe('send');
    expect(map.icons).not.toHaveProperty('object.destination');
  });

  it('rejects a concept that does not map to a name', () => {
    expect(() => readMap({ 'nav.bad': 3 })).toThrow(/nav.bad/);
  });
});

describe('upmoMarks', () => {
  it('lists the caret and status marks once each', () => {
    expect(upmoMarks(readMap(json))).toEqual([
      'caret',
      'status-build',
      'status-done',
      'status-failed',
      'status-idle',
      'status-plan',
    ]);
    expect(isUpmoMark('chevron-down')).toBe(false);
  });

  it('has an SVG in content/assets/icons for every mark the map names', () => {
    for (const name of upmoMarks(readMap(json))) expect(existsSync(new URL(`${name}.svg`, assets))).toBe(true);
  });
});

describe('toModule', () => {
  const { js, dts } = toModule(readMap(json));

  it('exports the map and types each concept', () => {
    expect(js).toContain('"action.send": "caret"');
    expect(dts).toContain('  readonly "action.send": "caret";');
    expect(dts).toContain('export type IconConcept = keyof typeof icons;');
  });
});
