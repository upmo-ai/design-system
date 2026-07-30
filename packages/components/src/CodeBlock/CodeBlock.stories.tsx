import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const MultiLine: Story = {
  args: {
    language: 'tsx',
    code: `import { Button } from '@upmo-ai/components';

export function Deploy() {
  return <Button>Deploy agent</Button>;
}`,
  },
};
