export interface IconMap {
  set: string;
  stroke: number;
  icons: Record<string, string>;
}

const metaKeys = new Set(['$comment', 'set', 'stroke']);

// icons.json holds metadata keys next to the concept keys; split them.
export function readMap(json: Record<string, unknown>): IconMap {
  const icons: Record<string, string> = {};
  for (const [k, v] of Object.entries(json)) {
    if (metaKeys.has(k)) continue;
    if (typeof v !== 'string') throw new Error(`icons.json: ${k} must map to an icon name`);
    icons[k] = v;
  }
  return { set: String(json.set), stroke: Number(json.stroke), icons };
}

// Names that are Upmo's own marks in content/assets/icons rather than Tabler glyphs.
export function isUpmoMark(name: string): boolean {
  return name === 'caret' || name.startsWith('status-');
}

export function upmoMarks(map: IconMap): string[] {
  return [...new Set(Object.values(map.icons).filter(isUpmoMark))].sort();
}

export function toModule(map: IconMap): { js: string; dts: string } {
  const head = '// Generated from icons.json by scripts/build.ts. Do not edit.\n';
  const js = [
    `export const set = ${JSON.stringify(map.set)};`,
    `export const stroke = ${map.stroke};`,
    `export const icons = ${JSON.stringify(map.icons, null, 2)};`,
  ];
  const rows = Object.entries(map.icons).map(([k, v]) => `  readonly ${JSON.stringify(k)}: ${JSON.stringify(v)};`);
  const dts = [
    `export declare const set: ${JSON.stringify(map.set)};`,
    `export declare const stroke: ${map.stroke};`,
    `export declare const icons: {\n${rows.join('\n')}\n};`,
    'export type IconConcept = keyof typeof icons;',
    'export type IconName = (typeof icons)[IconConcept];',
  ];
  return { js: head + js.join('\n') + '\n', dts: head + dts.join('\n') + '\n' };
}
