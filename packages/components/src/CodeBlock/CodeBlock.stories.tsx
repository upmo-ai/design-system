import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { CodeBlock } from './CodeBlock.tsx';

const meta: Meta<typeof CodeBlock> = {
  title: 'Compositions/CodeBlock',
  component: CodeBlock,
  args: {
    language: 'bash',
    code: 'pnpm add @upmo-ai/components @upmo-ai/theme @upmo-ai/tokens',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Playground: Story = {};

export const Tsx: Story = {
  args: {
    language: 'tsx',
    lineNumbers: true,
    code: `import { Button, Badge } from '@upmo-ai/components';

export function Deploy({ count }: { count: number }) {
  // Deploy the agent and show how many are running.
  const label = count > 0 ? \`\${count} running\` : 'Idle';
  return (
    <div>
      <Badge color="emerald">{label}</Badge>
      <Button onClick={() => deploy()}>Deploy agent</Button>
    </div>
  );
}`,
  },
};

export const Languages: Story = {
  render: () => (
    <Stack>
      <CodeBlock
        language="json"
        code={`{
  "tool": "send_invoice",
  "args": { "customerId": "cus_8821", "amount": 2400 },
  "idempotencyKey": "req_4f2a"
}`}
      />
      <CodeBlock
        language="python"
        code={`def reconcile(invoices, payments):
    matched = [i for i in invoices if i.id in payments]
    return len(matched), len(invoices) - len(matched)`}
      />
      <CodeBlock language="text" code="Plain text: no highlighting applied." />
    </Stack>
  ),
};
