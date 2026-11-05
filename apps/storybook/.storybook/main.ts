import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Stories live next to the component sources in @upmo-ai/components, so the
  // gallery always reflects the real, shipped components.
  // The brand kit has no component of its own, so its gallery lives in this app.
  stories: ['../../../packages/components/src/**/*.stories.@(ts|tsx)', '../stories/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: { disableTelemetry: true },
};

export default config;
