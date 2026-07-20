import { extname } from 'node:path';

// Words the glossary retires; content/glossary.md is the one place that names them.
export const retired = ['mission', 'missions', 'sub-mission', 'harness', 'harnesses', 'analytics', 'inbox', 'conversation', 'conversations', 'destination', 'destinations'];

const retiredWord = new RegExp(`\\b(?:${retired.join('|')})\\b`, 'gi');
const textFile = new Set(['.md', '.mdx', '.json', '.html', '.css']);

export function findRetiredWords(text: string): { line: number; match: string }[] {
  return text.split('\n').flatMap((line, i) => [...line.matchAll(retiredWord)].map((m) => ({ line: i + 1, match: m[0] })));
}

export const isTextFile = (path: string) => textFile.has(extname(path));
