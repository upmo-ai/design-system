import { defineConfig } from 'vitest/config';

// Root config delegates to each package's own vitest config via projects, so the
// components package runs under jsdom with its setup file while the tokens and
// theme packages run in the default node environment.
export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
});
