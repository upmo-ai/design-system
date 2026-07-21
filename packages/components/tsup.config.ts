import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { resolve: true },
  tsconfig: 'tsconfig.json',
  clean: true,
  treeshake: true,
  sourcemap: true,
  // CSS modules are resolved by esbuild; the collected CSS is emitted next to
  // the JS as index.css, exported via the "./styles.css" subpath.
  injectStyle: false,
  external: [
    '@mantine/core',
    '@mantine/hooks',
    '@tabler/icons-react',
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@upmo-ai/tokens',
  ],
  esbuildOptions(options) {
    // Deterministic, readable CSS-module class names: upmo-<name>-<hash>.
    options.loader = { ...options.loader };
  },
});
