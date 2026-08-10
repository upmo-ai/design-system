import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalCard, BudgetCard, DeliveryCard, PhaseRail, TaskHeader } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('ApprovalCard', () => {
  it('names the action and fires approve/deny', () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    renderThemed(<ApprovalCard action="Send the digest" onApprove={onApprove} onDeny={onDeny} />);
    expect(screen.getByText(/Send the digest/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onDeny).toHaveBeenCalledOnce();
  });

  it('renders the action as the title with an overridable description, no double punctuation', () => {
    const { container, rerender } = renderThemed(
      <ApprovalCard action="Send the digest." onApprove={() => {}} onDeny={() => {}} />,
    );
    expect(container.querySelector('.upmo-approval__title')?.textContent).toBe('Send the digest.');
    expect(container.textContent).not.toContain('..');
    expect(screen.getByText('Approve to continue, deny to let the agent find another way.')).toBeInTheDocument();
    rerender(<ApprovalCard action="Send" description="It goes to 40 people." onApprove={() => {}} onDeny={() => {}} />);
    expect(screen.getByText('It goes to 40 people.')).toBeInTheDocument();
  });

  it('is a group labelled by the action, not an alert', () => {
    renderThemed(<ApprovalCard action="Send the digest" onApprove={() => {}} onDeny={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Send the digest' })).toBeInTheDocument();
  });

  it('shows progress on Approve and disables Deny when busy', () => {
    renderThemed(<ApprovalCard action="x" onApprove={() => {}} onDeny={() => {}} busy />);
    const approve = screen.getByRole('button', { name: 'Approve' });
    expect(approve).toHaveAttribute('data-loading');
    expect(approve).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Deny' })).toBeDisabled();
  });

  it('shows the estimated cost', () => {
    renderThemed(<ApprovalCard action="x" cost="Estimated cost $0.40" onApprove={() => {}} onDeny={() => {}} />);
    expect(screen.getByText('Estimated cost $0.40')).toBeInTheDocument();
  });

  it('replaces the buttons with the outcome once decided', () => {
    const { container, rerender } = renderThemed(
      <ApprovalCard action="Send" state="approved" decidedBy="Sam" decidedAt="10:42" onApprove={() => {}} onDeny={() => {}} />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Approved by Sam at 10:42')).toBeInTheDocument();
    expect(container.querySelector('.upmo-tone-positive')).toBeTruthy();
    rerender(<ApprovalCard action="Send" state="denied" decidedBy="Sam" onApprove={() => {}} onDeny={() => {}} />);
    expect(screen.getByText('Denied by Sam')).toBeInTheDocument();
    expect(container.querySelector('.upmo-tone-neutral')).toBeTruthy();
    rerender(<ApprovalCard action="Send" state="expired" onApprove={() => {}} onDeny={() => {}} />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.queryByText(/Approve to continue/)).not.toBeInTheDocument();
  });

  it('is a critical card with a danger-filled library Approve button when destructive', () => {
    const { container } = renderThemed(
      <ApprovalCard action="Delete records" destructive onApprove={() => {}} onDeny={() => {}} />,
    );
    expect(container.querySelector('.upmo-tone-critical')).toBeTruthy();
    const approve = screen.getByRole('button', { name: 'Approve' });
    expect(approve).toHaveClass('upmo-button');
    // The red fill resolves to the danger token (theme resolver), and this inline
    // variable is what the styles.css ink-on-brand text rule keys on.
    expect(approve.getAttribute('style')).toContain('var(--mantine-color-red-filled)');
  });
});

describe('PhaseRail', () => {
  it('marks done, current and future phases', () => {
    const { container } = renderThemed(<PhaseRail current="Working" />);
    const items = container.querySelectorAll('.upmo-phaserail__item');
    // Preparing, Planning done; Working current; Checking future.
    expect(items[0].getAttribute('data-done')).toBe('true');
    expect(items[1].getAttribute('data-done')).toBe('true');
    expect(items[2].getAttribute('data-current')).toBe('true');
    expect(items[3].getAttribute('data-done')).toBeNull();
  });

  it('marks every node done when the task is done', () => {
    const { container } = renderThemed(<PhaseRail current={null} done />);
    const done = container.querySelectorAll('.upmo-phaserail__item[data-done="true"]');
    expect(done.length).toBe(4);
  });
});

describe('BudgetCard', () => {
  it('shows percent and the meta line', () => {
    renderThemed(<BudgetCard percent={42} cost="€2.10" limit="€5.00" tokens={38000} pauseAt={90} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText(/€2.10 of €5.00 · 38k tokens · pauses at 90%/)).toBeInTheDocument();
  });

  it('fires edit', () => {
    const onEdit = vi.fn();
    renderThemed(<BudgetCard percent={10} cost="€1" limit="€5" onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit budget' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe('DeliveryCard', () => {
  it('shows the channel and timing', () => {
    renderThemed(<DeliveryCard channel="#finance on Slack" when="After the task is done" />);
    expect(screen.getByText('#finance on Slack')).toBeInTheDocument();
    expect(screen.getByText('After the task is done')).toBeInTheDocument();
  });
});

describe('TaskHeader', () => {
  it('renders title, status and actions', () => {
    const onNext = vi.fn();
    renderThemed(
      <TaskHeader
        title="Invoice sync"
        status="Working"
        meta={{ runNumber: 14, cost: '€2.10' }}
        canAdvance
        onNextPhase={onNext}
        onTogglePause={() => {}}
        onShare={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Invoice sync' })).toBeInTheDocument();
    // The status word appears both in the badge and the caret indicator.
    expect(screen.getAllByText('Working').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('toggles pause label', () => {
    const { rerender } = renderThemed(
      <TaskHeader title="t" status="Working" paused={false} onTogglePause={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    rerender(<TaskHeader title="t" status="Working" paused onTogglePause={() => {}} />);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<TaskHeader title="t" status="Done" />, theme);
      unmount();
    }
  });
});
