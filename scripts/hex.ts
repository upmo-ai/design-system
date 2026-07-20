import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// #rgb, #rgba, #rrggbb, #rrggbbaa as a whole word; "&#123;" entities are not colours.
const hexColour = /(?<!&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;

export function findHexColours(text: string): { line: number; match: string }[] {
  return text.split('\n').flatMap((line, i) => [...line.matchAll(hexColour)].map((m) => ({ line: i + 1, match: m[0] })));
}

export function listFiles(dir: string, skip: string[] = []): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (skip.includes(path)) return [];
    return statSync(path).isDirectory() ? listFiles(path, skip) : [path];
  });
}
