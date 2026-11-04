import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { TestConnectionPanel } from './TestConnectionPanel.tsx';

const meta: Meta<typeof TestConnectionPanel> = {
  title: 'Agent surfaces/TestConnectionPanel',
  component: TestConnectionPanel,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof TestConnectionPanel>;

export const States: Story = {
  render: () => (
    <Stack maw={420} gap="xl">
      <TestConnectionPanel state="idle" onTest={() => {}} />
      <TestConnectionPanel state="testing" onTest={() => {}} />
      <TestConnectionPanel state="success" latencyMs={128} onTest={() => {}} />
      <TestConnectionPanel state="error" error="401 Unauthorized: the token was rejected." onTest={() => {}} />
    </Stack>
  ),
};

/**
 * The Test button is as wide as its label. Add the `upmo-testconn--full-width`
 * class to stretch it across the panel; the status area is full width either way.
 */
export const ButtonWidth: Story = {
  render: () => (
    <Stack maw={420} gap="xl">
      <TestConnectionPanel state="success" latencyMs={128} onTest={() => {}} />
      <TestConnectionPanel
        state="success"
        latencyMs={128}
        onTest={() => {}}
        className="upmo-testconn--full-width"
      />
    </Stack>
  ),
};
