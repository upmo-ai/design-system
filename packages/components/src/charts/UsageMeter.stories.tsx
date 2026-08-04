import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { UsageMeter } from './UsageMeter.tsx';

const meta: Meta<typeof UsageMeter> = {
  title: 'Usage/UsageMeter',
  component: UsageMeter,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof UsageMeter>;

export const Thresholds: Story = {
  render: () => (
    <Stack maw={420}>
      <UsageMeter label="Monthly spend" percent={38} used="€38" limit="€100" />
      <UsageMeter label="Seats" percent={75} used="15" limit="20" />
      <UsageMeter label="API quota" percent={95} used="9,500" limit="10,000" />
    </Stack>
  ),
};
