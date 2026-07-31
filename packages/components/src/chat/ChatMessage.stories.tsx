import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { ChatMessage } from './ChatMessage.tsx';

const meta: Meta<typeof ChatMessage> = {
  title: 'Agent surfaces/ChatMessage',
  component: ChatMessage,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const Thread: Story = {
  render: () => (
    <Stack gap={0} maw={560}>
      <ChatMessage role="system" content="Finance agent started. Context: Q3 books." />
      <ChatMessage role="user" content="Reconcile the open invoices against payments." tokens={12} cost="$0.001" />
      <ChatMessage
        role="assistant"
        content="I reconciled 138 of 142 invoices. 4 are unmatched; I'll flag those for review."
        model="Claude Sonnet"
        tokens={212}
        duration="1.4 s"
        cost="$0.012"
      />
    </Stack>
  ),
};

export const Streaming: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ChatMessage role="assistant" content="Fetching the latest invoices from Stripe" streaming model="Claude Sonnet" />
    </div>
  ),
};
