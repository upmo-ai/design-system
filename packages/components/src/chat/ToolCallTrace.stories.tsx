import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mantine/core';
import { ToolCallTrace } from './ToolCallTrace.tsx';

const meta: Meta<typeof ToolCallTrace> = {
  title: 'Agent surfaces/ToolCallTrace',
  component: ToolCallTrace,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ToolCallTrace>;

export const States: Story = {
  render: () => (
    <Stack maw={560}>
      <ToolCallTrace name="list_invoices" status="running" args={{ status: 'open', limit: 200 }} duration="0.6 s" />
      <ToolCallTrace
        name="match_payments"
        status="success"
        defaultOpen
        args={{ invoices: 142 }}
        result={{ matched: 138, unmatched: 4 }}
        duration="1.1 s"
      />
      <ToolCallTrace
        name="send_digest"
        status="error"
        args={{ channel: '#finance' }}
        error="Slack webhook returned 403 Forbidden."
        duration="0.3 s"
      />
      <ToolCallTrace name="archive_run" status="pending" />
    </Stack>
  ),
};
