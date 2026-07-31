import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { EventStream, type EventItem } from './EventStream.tsx';

const meta: Meta<typeof EventStream> = {
  title: 'Agent surfaces/EventStream',
  component: EventStream,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof EventStream>;

const base: EventItem[] = [
  { id: '1', time: '08:00:58', status: 'Preparing', message: 'Run queued for Invoice sync.' },
  { id: '2', time: '08:01:02', status: 'Planning', message: 'Drafted a 4-step plan.', detail: ['1. Fetch open invoices', '2. Match to payments'] },
  { id: '3', time: '08:01:09', status: 'Working', message: 'Fetched 142 open invoices from Stripe.' },
  { id: '4', time: '08:01:14', status: 'Working', message: 'Matched 138 of 142 to payments.' },
  { id: '5', time: '08:01:20', status: 'Checking', message: 'Verifying 4 unmatched invoices.', live: true },
];

export const Static: Story = {
  render: () => {
    const [following, setFollowing] = useState(true);
    return <EventStream events={base} following={following} onFollowChange={setFollowing} />;
  },
};

export const Done: Story = {
  render: () => {
    const [following, setFollowing] = useState(true);
    const events: EventItem[] = [
      ...base.slice(0, 4),
      { id: '5', time: '08:01:20', status: 'Checking', message: 'Verified all invoices.' },
      { id: '6', time: '08:01:26', status: 'Done', message: 'Invoice sync finished. 142 processed.' },
    ];
    return <EventStream events={events} following={following} onFollowChange={setFollowing} />;
  },
};

// A live demo: new events arrive on a timer and the stream follows the edge.
export const Following: Story = {
  render: () => {
    const [events, setEvents] = useState<EventItem[]>(base);
    const [following, setFollowing] = useState(true);

    useEffect(() => {
      let n = events.length;
      const id = setInterval(() => {
        n += 1;
        if (n > 24) return;
        const t = `08:01:${String(20 + n).padStart(2, '0')}`;
        setEvents((prev) => [
          ...prev.map((e) => ({ ...e, live: false })),
          { id: String(n), time: t, status: 'Working', message: `Processed batch ${n - 4}.`, live: true },
        ]);
      }, 1500);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <EventStream events={events} following={following} onFollowChange={setFollowing} maxHeight={260} />
    );
  },
};
