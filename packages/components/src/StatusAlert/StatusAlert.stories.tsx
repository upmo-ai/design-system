import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { StatusAlert } from './StatusAlert.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof StatusAlert> = {
  title: 'Compositions/StatusAlert',
  component: StatusAlert,
  args: { tone: 'info', title: 'Provider connected', children: 'Agents can now use Anthropic models.' },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof StatusAlert>;

export const Playground: Story = {};

const tones: Story['render'] = () => (
  <Stack maw={560}>
    <StatusAlert tone="info" title="Keys stay on your server">
      The key is stored as a credential reference; the value never leaves the server.
    </StatusAlert>
    <StatusAlert tone="positive" onDismiss={() => {}}>
      Connector saved.
    </StatusAlert>
    <StatusAlert
      tone="attention"
      title="Budget at 80%"
      actions={
        <Button size="xs" variant="default">
          Raise budget
        </Button>
      }
    >
      This task has spent $8.00 of its $10.00 budget.
    </StatusAlert>
    <StatusAlert
      tone="critical"
      title="Provider rejected the key"
      onDismiss={() => {}}
      actions={
        <>
          <Button size="xs">Replace key</Button>
          <Button size="xs" variant="subtle">
            View log
          </Button>
        </>
      }
    >
      Anthropic answered 401. Agents using it are paused.
    </StatusAlert>
  </Stack>
);

export const Tones: Story = { render: tones };
export const Dark: Story = { render: tones, globals: { theme: 'dark' } };
export const HighContrast: Story = { render: tones, globals: { theme: 'hc' } };
