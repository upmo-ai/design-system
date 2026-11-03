import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { toCss, toFontFaces, toModule, type TokenFile } from './lib.ts';

const src = new URL('../tokens.json', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const tokens: TokenFile = JSON.parse(readFileSync(src, 'utf8'));
const { js, dts } = toModule(tokens);

mkdirSync(dist, { recursive: true });
writeFileSync(new URL('tokens.css', dist), toCss(tokens));
writeFileSync(new URL('tokens.js', dist), js);
writeFileSync(new URL('tokens.d.ts', dist), dts);
copyFileSync(src, new URL('tokens.json', dist));

// fonts.css: @font-face rules for the token fonts, backed by woff2 files copied
// from @fontsource (dev dependencies, so consumers get no runtime dependency).
// Only the weights and subsets tokens.json lists ship. All three fonts are SIL
// OFL 1.1; each licence travels with its files, as the OFL requires.
const fontsDir = new URL('fonts/', dist);
mkdirSync(fontsDir, { recursive: true });
const sheets = ['/* Upmo token fonts, generated from tokens.json. Do not edit. SIL OFL 1.1, see fonts/*-OFL.txt. */'];
let fileCount = 0;
for (const face of tokens.type.fonts ?? []) {
  const pkg = new URL(`../node_modules/${face.source}/`, import.meta.url);
  const slug = face.source.split('/')[1];
  for (const weight of face.weights) {
    const sheet = readFileSync(new URL(`${weight}.css`, pkg), 'utf8');
    const { css, files } = toFontFaces(sheet, slug, tokens.type.fontSubsets ?? ['latin']);
    sheets.push(css);
    for (const file of files) copyFileSync(new URL(`files/${file}`, pkg), new URL(file, fontsDir));
    fileCount += files.length;
  }
  copyFileSync(new URL('LICENSE', pkg), new URL(`${slug}-OFL.txt`, fontsDir));
}
writeFileSync(new URL('fonts.css', dist), sheets.join('\n\n') + '\n');

console.log(`tokens: built tokens.css, tokens.js, tokens.d.ts, tokens.json, fonts.css (${fileCount} woff2 files)`);
