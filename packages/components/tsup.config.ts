import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/dates.ts'],
  format: ['esm'],
  dts: { resolve: true },
  tsconfig: 'tsconfig.json',
  clean: true,
  treeshake: true,
  sourcemap: true,
  // The library ships a single plain stylesheet (src/styles.css), bundled to
  // dist/index.css and exported at the "./styles.css" subpath. No CSS-module
  // name hashing (it does not survive the bundler reliably); class names are
  // stable, prefixed `upmo-*` globals instead.
  injectStyle: false,
  external: [
    '@mantine/core',
    '@mantine/hooks',
    '@mantine/dates',
    'dayjs',
    '@tabler/icons-react',
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@upmo-ai/tokens',
  ],
});
