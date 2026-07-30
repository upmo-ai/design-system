import type { Meta, StoryObj } from '@storybook/react-vite';
import { JsonBlock } from './JsonBlock.tsx';

const meta: Meta<typeof JsonBlock> = {
  title: 'Compositions/JsonBlock',
  component: JsonBlock,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof JsonBlock>;

export const ToolCallArgs: Story = {
  args: {
    value: {
      tool: 'send_invoice',
      args: { customerId: 'cus_8821', amount: 2400, currency: 'usd' },
      idempotencyKey: 'req_4f2a',
    },
  },
};
