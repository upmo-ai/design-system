import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Text } from '@mantine/core';
import { ApprovalCard } from './ApprovalCard.tsx';

const meta: Meta<typeof ApprovalCard> = {
  title: 'Agent surfaces/ApprovalCard',
  component: ApprovalCard,
  args: { action: 'Send the daily finance digest' },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ApprovalCard>;

export const Attention: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard {...args} onApprove={() => {}} onDeny={() => {}} />
    </div>
  ),
};

export const Destructive: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard
        action="Delete 1,204 archived records"
        destructive
        onApprove={() => {}}
        onDeny={() => {}}
      />
    </div>
  ),
};

export const WithPreview: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard action="Post the release notes to #announcements" onApprove={() => {}} onDeny={() => {}}>
        <Text size="sm" c="dimmed">
          Preview: "Upmo 2.4 ships the new activity stream and budget guardrails..."
        </Text>
      </ApprovalCard>
    </div>
  ),
};
