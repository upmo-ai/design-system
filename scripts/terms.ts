import { extname } from 'node:path';

// Words the glossary retires. One concept, one word, everywhere. Timothy's
// "mission" is Upmo's "task"; the others are legacy synonyms the product dropped.
export const retired = [
  'mission',
  'missions',
  'sub-mission',
  'harness',
  'harnesses',
  'analytics',
  'inbox',
  'conversation',
  'conversations',
  'destination',
  'destinations',
];

const retiredWord = new RegExp(`\\b(?:${retired.join('|')})\\b`, 'gi');
const textFile = new Set(['.md', '.mdx', '.json', '.html', '.css', '.ts', '.tsx']);

export function findRetiredWords(text: string): { line: number; match: string }[] {
  return text.split('\n').flatMap((line, i) => [...line.matchAll(retiredWord)].map((m) => ({ line: i + 1, match: m[0] })));
}

export const isTextFile = (path: string) => textFile.has(extname(path));
