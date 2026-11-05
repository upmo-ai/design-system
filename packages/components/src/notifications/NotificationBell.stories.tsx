import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconAlertTriangle, IconCircleCheck, IconMessageQuestion } from '@tabler/icons-react';
import { Button } from '../Button/Button.tsx';
import { ApprovalCard } from '../task/ApprovalCard.tsx';
import { NotificationBell, NotificationItem } from './NotificationBell.tsx';

const meta: Meta<typeof NotificationBell> = {
  title: 'Agent surfaces/NotificationBell',
  component: NotificationBell,
  // The popover is portaled and opens under the bell, so the story needs room.
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 420, maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const Unread: Story = {
  render: () => (
    <NotificationBell count={2} defaultOpened>
      <NotificationItem
        unread
        icon={<IconCircleCheck size={18} />}
        title="Daily finance digest sent"
        meta="Finance agent, 09:41"
        action={<Button size="xs" variant="default">Open run</Button>}
      />
      <NotificationItem
        unread
        icon={<IconAlertTriangle size={18} />}
        title="4 invoices could not be matched"
        meta="Finance agent, 09:12"
      />
      <NotificationItem
        icon={<IconCircleCheck size={18} />}
        title="Support requests triaged"
        meta="Support agent, yesterday"
      />
    </NotificationBell>
  ),
};

export const ManyUnread: Story = {
  render: () => (
    <NotificationBell count={120}>
      <NotificationItem unread title="Daily finance digest sent" meta="Finance agent, 09:41" />
    </NotificationBell>
  ),
};

export const Empty: Story = {
  render: () => <NotificationBell count={0} defaultOpened />,
};

export const Loading: Story = {
  render: () => <NotificationBell count={0} defaultOpened busy />,
};

/** An ApprovalCard inside an item. With no onDeny it offers Approve alone. */
export const WithApprovals: Story = {
  render: () => (
    <NotificationBell count={2} defaultOpened width={360}>
      <NotificationItem unread icon={<IconMessageQuestion size={18} />} title="Needs your answer" meta="Finance agent, 09:50">
        <ApprovalCard action="Use the Q3 workbook for the close?" onApprove={() => {}} />
      </NotificationItem>
      <NotificationItem unread title="Needs your approval" meta="Support agent, 09:44">
        <ApprovalCard action="Send the reply to 40 customers" onApprove={() => {}} onDeny={() => {}} />
      </NotificationItem>
    </NotificationBell>
  ),
};
