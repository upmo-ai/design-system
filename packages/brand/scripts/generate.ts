// Generates every file in the brand kit from src/geometry.ts and the tokens.
//
//   pnpm --filter @upmo-ai/brand generate           write the files
//   pnpm --filter @upmo-ai/brand generate --check   fail if any file differs
//
// The files are committed. The PNGs depend on the rasteriser build, so
// regenerate them in the pinned container (see the package README); CI runs
// --check on the same platform.
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRasters, buildSvgFiles, icoSizes, icoSource, mirrors, toIco } from './lib.ts';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(pkg, '..', '..');
const check = process.argv.includes('--check');

function rasterise(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  });
  return Buffer.from(resvg.render().asPng());
}

const tokens = JSON.parse(readFileSync(join(pkg, '..', 'tokens', 'tokens.json'), 'utf8'));

// Everything to write, keyed by absolute path.
const outputs = new Map<string, string | Buffer>();
const svgFiles = buildSvgFiles(tokens);
for (const [path, text] of svgFiles) outputs.set(join(pkg, path), text);
for (const [path, raster] of buildRasters(tokens)) {
  outputs.set(join(pkg, path), rasterise(raster.svg, raster.width));
}
const ico = icoSource(tokens);
outputs.set(
  join(pkg, 'assets/web/favicon.ico'),
  toIco(icoSizes.map((size) => ({ size, png: rasterise(ico, size) }))),
);
for (const [target, source] of Object.entries(mirrors)) {
  const text = svgFiles.get(source);
  if (text === undefined) throw new Error(`mirror source ${source} is not generated`);
  outputs.set(join(repo, target), text);
}

// Generated directories hold nothing but generated files, so anything else
// found there is left over from a removed output.
const owned = ['assets/svg', 'assets/web'].map((dir) => join(pkg, dir));
const stale = owned.flatMap((dir) =>
  existsSync(dir) ? readdirSync(dir).map((name) => join(dir, name)) : [],
).filter((path) => !outputs.has(path));

const differs = [...outputs].filter(([path, data]) => {
  if (!existsSync(path)) return true;
  const current = readFileSync(path);
  return !current.equals(typeof data === 'string' ? Buffer.from(data) : data);
});

const name = (path: string) => relative(repo, path);

if (check) {
  if (differs.length || stale.length) {
    for (const [path] of differs) console.error(`brand: ${name(path)} is out of date`);
    for (const path of stale) console.error(`brand: ${name(path)} is not a generated file`);
    console.error('brand: run the generator (see packages/brand/README.md) and commit the result');
    process.exit(1);
  }
  console.log(`brand: ${outputs.size} files are up to date`);
} else {
  for (const [path, data] of differs) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
  }
  for (const path of stale) rmSync(path);
  console.log(`brand: ${outputs.size} files, ${differs.length} written, ${stale.length} removed`);
}
