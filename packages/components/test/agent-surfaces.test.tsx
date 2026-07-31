import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventStream, LivenessIndicator, type EventItem } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

const events: EventItem[] = [
  { id: '1', time: '08:01:02', status: 'Planning', message: 'Drafted a plan.' },
  { id: '2', time: '08:01:09', status: 'Working', message: 'Fetched 142 invoices.' },
  { id: '3', time: '08:01:20', status: 'Checking', message: 'Verifying results.', live: true },
];

describe('EventStream', () => {
  it('renders each event with its time, status and message', () => {
    renderThemed(<EventStream events={events} following />);
    expect(screen.getByText('08:01:02')).toBeInTheDocument();
    expect(screen.getByText('Fetched 142 invoices.')).toBeInTheDocument();
    // The status word appears via StatusBadge.
    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  it('shows the count and the "Following live" header when following', () => {
    renderThemed(<EventStream events={events} following />);
    expect(screen.getByText('3 events')).toBeInTheDocument();
    expect(screen.getByText('Following live')).toBeInTheDocument();
  });

  it('offers a jump-to-live control when not following, and resumes on click', () => {
    const onFollowChange = vi.fn();
    renderThemed(<EventStream events={events} following={false} onFollowChange={onFollowChange} />);
    const jump = screen.getByRole('button', { name: /jump to live/i });
    expect(jump).toBeInTheDocument();
    fireEvent.click(jump);
    expect(onFollowChange).toHaveBeenCalledWith(true);
  });

  it('renders detail lines under the message', () => {
    const withDetail: EventItem[] = [
      { id: '1', time: '08:01:02', status: 'Planning', message: 'Plan', detail: ['step one', 'step two'] },
    ];
    renderThemed(<EventStream events={withDetail} following />);
    expect(screen.getByText('step one')).toBeInTheDocument();
    expect(screen.getByText('step two')).toBeInTheDocument();
  });

  it('labels the region', () => {
    renderThemed(<EventStream events={events} label="Run activity" following />);
    expect(screen.getByRole('region', { name: 'Run activity' })).toBeInTheDocument();
  });
});

describe('LivenessIndicator', () => {
  it('shows the count and an active label when runs are live', () => {
    renderThemed(<LivenessIndicator count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '3 agents working' })).toBeInTheDocument();
  });

  it('hides the count and reads idle at zero', () => {
    renderThemed(<LivenessIndicator count={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'No agents working' })).toBeInTheDocument();
  });

  it('uses the singular at one', () => {
    renderThemed(<LivenessIndicator count={1} />);
    expect(screen.getByRole('status', { name: '1 agent working' })).toBeInTheDocument();
  });

  it('renders as a button and fires onClick', () => {
    const onClick = vi.fn();
    renderThemed(<LivenessIndicator count={2} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: '2 agents working' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<LivenessIndicator count={2} />, theme);
      unmount();
    }
  });
});
