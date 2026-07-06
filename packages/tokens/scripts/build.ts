import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { toCss, toModule, type TokenFile } from './lib.ts';

const src = new URL('../tokens.json', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const tokens: TokenFile = JSON.parse(readFileSync(src, 'utf8'));
const { js, dts } = toModule(tokens);

mkdirSync(dist, { recursive: true });
writeFileSync(new URL('tokens.css', dist), toCss(tokens));
writeFileSync(new URL('tokens.js', dist), js);
writeFileSync(new URL('tokens.d.ts', dist), dts);
copyFileSync(src, new URL('tokens.json', dist));
