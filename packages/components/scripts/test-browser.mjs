// Runs the real-browser suite with UPMO_REQUIRE_BROWSER=1 set, in a way that
// works in any shell (an inline `VAR=1 cmd` only works in POSIX shells).
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const vitestBin = resolve(dirname(createRequire(import.meta.url).resolve('vitest/package.json')), 'vitest.mjs');
const result = spawnSync(
  process.execPath,
  [vitestBin, 'run', '.browser.test.ts', ...process.argv.slice(2)],
  { stdio: 'inherit', env: { ...process.env, UPMO_REQUIRE_BROWSER: '1' } },
);
process.exit(result.status ?? 1);
