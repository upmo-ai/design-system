import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Group, PasswordInput, Radio, Stack, TextInput } from '@mantine/core';
import { ConnectWizard } from './ConnectWizard.tsx';
import { BrandTileGrid } from './BrandTileGrid.tsx';
import { TestConnectionPanel, type TestConnectionState } from './TestConnectionPanel.tsx';

const meta: Meta<typeof ConnectWizard> = {
  title: 'Agent surfaces/ConnectWizard',
  component: ConnectWizard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ConnectWizard>;

export const Flow: Story = {
  render: () => {
    const [active, setActive] = useState(0);
    const [tool, setTool] = useState('github');
    const [test, setTest] = useState<TestConnectionState>('idle');

    function runTest() {
      setTest('testing');
      setTimeout(() => setTest('success'), 900);
    }

    return (
      <ConnectWizard
        active={active}
        onStepChange={setActive}
        steps={[
          {
            label: 'Tool',
            description: 'Select service',
            content: (
              <Stack>
                <BrandTileGrid
                  items={[
                    { id: 'github', name: 'GitHub', description: 'Issues and PRs' },
                    { id: 'slack', name: 'Slack', description: 'Channels and messages' },
                    { id: 'stripe', name: 'Stripe', description: 'Payments' },
                    { id: 'notion', name: 'Notion', description: 'Docs and databases' },
                  ]}
                  selectedId={tool}
                  onSelect={setTool}
                />
                <Group justify="flex-end">
                  <Button onClick={() => setActive(1)}>Next</Button>
                </Group>
              </Stack>
            ),
          },
          {
            label: 'Authentication',
            description: 'Credentials',
            content: (
              <Stack maw={420}>
                <PasswordInput label="Access token" placeholder="ghp_..." />
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setActive(0)}>
                    Back
                  </Button>
                  <Button onClick={() => setActive(2)}>Next</Button>
                </Group>
              </Stack>
            ),
          },
          {
            label: 'Permissions',
            description: 'Scope and changes',
            content: (
              <Stack maw={420}>
                <Radio.Group label="Changes" defaultValue="ask">
                  <Stack mt="xs" gap="xs">
                    <Radio value="ask" label="Ask first" />
                    <Radio value="allow" label="Allow" />
                    <Radio value="block" label="Block" />
                  </Stack>
                </Radio.Group>
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setActive(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setActive(3)}>Next</Button>
                </Group>
              </Stack>
            ),
          },
          {
            label: 'Validation',
            description: 'Test connection',
            content: (
              <Stack maw={420}>
                <TestConnectionPanel state={test} onTest={runTest} latencyMs={128} />
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setActive(2)}>
                    Back
                  </Button>
                  <Button disabled={test !== 'success'}>Connect</Button>
                </Group>
              </Stack>
            ),
          },
        ]}
      />
    );
  },
};

/**
 * An edit flow: the service of an existing connection is locked. The first step
 * is `disabled`, so it shows in the stepper but cannot be picked.
 */
export const EditLocked: Story = {
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <ConnectWizard
        active={active}
        onStepChange={setActive}
        steps={[
          { label: 'Tool', description: 'GitHub', content: <p>The service cannot change.</p>, disabled: true },
          {
            label: 'Authentication',
            description: 'Credentials',
            content: (
              <Stack maw={420}>
                <PasswordInput label="Access token" placeholder="ghp_..." />
                <Group justify="flex-end">
                  <Button onClick={() => setActive(2)}>Next</Button>
                </Group>
              </Stack>
            ),
          },
          {
            label: 'Permissions',
            description: 'Scope and changes',
            content: (
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setActive(1)}>
                  Back
                </Button>
                <Button>Save</Button>
              </Group>
            ),
          },
        ]}
      />
    );
  },
};
