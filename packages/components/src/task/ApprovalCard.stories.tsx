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

/** Without onDeny the card offers Approve alone. */
export const ApproveOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard action="Use the Q3 workbook for the close?" onApprove={() => {}} />
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

export const WithCost: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard
        action="Re-run the quarterly forecast on the full dataset"
        cost="Estimated cost $0.40"
        onApprove={() => {}}
        onDeny={() => {}}
      />
    </div>
  ),
};

export const Busy: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ApprovalCard action="Send the daily finance digest" busy onApprove={() => {}} onDeny={() => {}} />
    </div>
  ),
};

export const Lifecycle: Story = {
  render: () => (
    <Stack gap="sm" style={{ maxWidth: 520 }}>
      <ApprovalCard
        action="Send the daily finance digest"
        state="approved"
        decidedBy="Sam"
        decidedAt="10:42"
        onApprove={() => {}}
        onDeny={() => {}}
      />
      <ApprovalCard
        action="Delete 1,204 archived records"
        destructive
        state="denied"
        decidedBy="Priya"
        decidedAt="09:15"
        onApprove={() => {}}
        onDeny={() => {}}
      />
      <ApprovalCard
        action="Post the release notes to #announcements"
        state="expired"
        decidedAt="18:00"
        onApprove={() => {}}
        onDeny={() => {}}
      />
    </Stack>
  ),
};
