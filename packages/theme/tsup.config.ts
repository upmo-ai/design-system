import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  // Mantine and React are provided by the consumer; tokens are inlined-safe but
  // kept external so the typed object is shared, not duplicated.
  external: ['@mantine/core', 'react', 'react-dom', '@upmo-ai/tokens'],
});
