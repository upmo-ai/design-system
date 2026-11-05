import { IconMail } from '@tabler/icons-react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalCard, Button, NotificationBell, NotificationItem } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('NotificationBell', () => {
  it('names the bell with the unread count and hides the badge', () => {
    renderThemed(<NotificationBell count={4} />);
    const bell = screen.getByRole('button', { name: 'Notifications, 4 unread' });
    const badge = bell.querySelector('.upmo-notification-bell__badge');
    expect(badge).toHaveTextContent('4');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('caps the badge at 99+ and keeps the exact count in the name', () => {
    const { rerender } = renderThemed(<NotificationBell count={120} />);
    const bell = screen.getByRole('button', { name: 'Notifications, 120 unread' });
    expect(bell.querySelector('.upmo-notification-bell__badge')).toHaveTextContent('99+');
    rerender(<NotificationBell count={120} max={9} />);
    expect(screen.getByRole('button', { name: 'Notifications, 120 unread' }).querySelector('.upmo-notification-bell__badge')).toHaveTextContent('9+');
  });

  it('drops the badge and the count at zero', () => {
    const { container } = renderThemed(<NotificationBell count={0} />);
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    expect(container.querySelector('.upmo-notification-bell__badge')).toBeNull();
  });

  it('takes a label and an unreadLabel for other languages', () => {
    renderThemed(<NotificationBell count={2} label="Alerts" unreadLabel={(n) => `Alerts: ${n} new`} />);
    expect(screen.getByRole('button', { name: 'Alerts: 2 new' })).toBeInTheDocument();
  });

  it('does not announce by itself: no live region', () => {
    const { container } = renderThemed(<NotificationBell count={2} />);
    expect(container.querySelector('[aria-live], [role="status"], [role="alert"]')).toBeNull();
  });

  it('opens a dialog named by its heading with the list; Escape closes it and returns focus to the bell', async () => {
    renderThemed(
      <NotificationBell count={2}>
        <NotificationItem title="Digest sent" meta="Finance agent, 09:41" unread />
        <NotificationItem title="Run finished" meta="Support agent, 09:12" />
      </NotificationBell>,
    );
    const bell = screen.getByRole('button', { name: 'Notifications, 2 unread' });
    expect(bell).toHaveAttribute('aria-haspopup', 'dialog');
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    act(() => bell.focus());
    fireEvent.click(bell);
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(bell).toHaveAttribute('aria-expanded', 'true');
    // Focus enters the dialog (the trap), otherwise the return to the bell below proves nothing.
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    expect(bell).not.toHaveFocus();
    expect(within(dialog).getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
    const list = within(dialog).getByRole('list', { name: 'Notifications' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(bell).toHaveFocus();
  });

  it('opens onto the dialog name, not onto an Approve button', async () => {
    const onApprove = vi.fn();
    renderThemed(
      <NotificationBell count={1}>
        <NotificationItem title="Needs an answer" unread>
          <ApprovalCard action="Use the Q3 workbook?" onApprove={onApprove} />
        </NotificationItem>
      </NotificationBell>,
    );
    const bell = screen.getByRole('button', { name: 'Notifications, 1 unread' });
    act(() => bell.focus());
    fireEvent.click(bell);
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    const heading = within(dialog).getByRole('heading', { level: 2, name: 'Notifications' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading).toHaveAttribute('tabindex', '-1');
    // A held Enter repeats on whatever has focus, so focus must not be on Approve.
    expect(within(dialog).getByRole('button', { name: 'Approve' })).not.toHaveFocus();
    expect(onApprove).not.toHaveBeenCalled();
  });

  it('names the dialog by a custom heading at the given level', async () => {
    renderThemed(
      <NotificationBell count={0} heading="Updates" headingLevel={3}>
        <NotificationItem title="Digest sent" />
      </NotificationBell>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog', { name: 'Updates' });
    expect(within(dialog).getByRole('heading', { level: 3, name: 'Updates' })).toBeInTheDocument();
    expect(within(dialog).getByRole('list', { name: 'Updates' })).toBeInTheDocument();
  });

  it('shows the compact empty state with no items', async () => {
    renderThemed(<NotificationBell count={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(within(dialog).getByRole('heading', { level: 3, name: 'You are all caught up' })).toBeInTheDocument();
    expect(within(dialog).getByText('Nothing needs your attention.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('list')).not.toBeInTheDocument();
    expect(dialog.querySelector('.upmo-empty-state--compact')).toBeTruthy();
  });

  it('puts the default empty state one level below the dialog heading', async () => {
    for (const level of [2, 3, 4, 5] as const) {
      const { unmount } = renderThemed(<NotificationBell count={0} headingLevel={level} />);
      fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('heading', { level, name: 'Notifications' })).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { level: level + 1, name: 'You are all caught up' })).toBeInTheDocument();
      unmount();
    }
  });

  it('accepts an empty slot in place of the default', async () => {
    renderThemed(<NotificationBell count={0} empty={<p>No news</p>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByText('No news')).toBeInTheDocument();
    expect(screen.queryByText('You are all caught up')).not.toBeInTheDocument();
  });

  it('shows a spinner and aria-busy while busy with no items, without the empty state', async () => {
    renderThemed(<NotificationBell count={0} busy />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(within(dialog).getByLabelText('Loading')).toBeInTheDocument();
    expect(within(dialog).queryByText('You are all caught up')).not.toBeInTheDocument();
  });

  it('keeps listed items readable while busy: the spinner shows and aria-busy is not set', async () => {
    renderThemed(
      <NotificationBell count={1} busy defaultOpened>
        <NotificationItem title="Digest sent" />
      </NotificationBell>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(dialog).not.toHaveAttribute('aria-busy');
    expect(within(dialog).getByLabelText('Loading')).toBeInTheDocument();
    expect(within(dialog).getByRole('listitem')).toBeInTheDocument();
  });

  it('names the spinner with loadingLabel', async () => {
    renderThemed(<NotificationBell count={0} busy loadingLabel="Wird geladen" defaultOpened />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Wird geladen')).toBeInTheDocument();
    expect(within(dialog).queryByLabelText('Loading')).not.toBeInTheDocument();
  });

  it('is controlled with opened and reports changes through onOpenedChange', async () => {
    const onOpenedChange = vi.fn();
    const { rerender } = renderThemed(<NotificationBell count={0} opened={false} onOpenedChange={onOpenedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(onOpenedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<NotificationBell count={0} opened onOpenedChange={onOpenedChange} />);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(onOpenedChange).toHaveBeenLastCalledWith(false);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenedChange).toHaveBeenCalledTimes(3);
  });

  it('starts open with defaultOpened', async () => {
    renderThemed(<NotificationBell count={1} defaultOpened />);
    expect(await screen.findByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<NotificationBell count={3} />, theme);
      expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('NotificationItem', () => {
  it('renders the title, meta, icon, action and children', async () => {
    const onOpen = vi.fn();
    renderThemed(
      <NotificationBell count={0} defaultOpened>
        <NotificationItem
          title="Digest sent"
          meta="Finance agent, 09:41"
          icon={<IconMail data-testid="icon" />}
          action={<Button size="xs" onClick={onOpen}>Open run</Button>}
        >
          <span>40 recipients</span>
        </NotificationItem>
      </NotificationBell>,
    );
    const item = await screen.findByRole('listitem');
    expect(within(item).getByText('Digest sent')).toBeInTheDocument();
    expect(within(item).getByText('Finance agent, 09:41')).toBeInTheDocument();
    expect(within(item).getByText('40 recipients')).toBeInTheDocument();
    expect(item.querySelector('.upmo-notification-item__icon')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(within(item).getByRole('button', { name: 'Open run' }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('marks an unread item for assistive tech and not by colour alone', async () => {
    renderThemed(
      <NotificationBell count={1} defaultOpened>
        <NotificationItem title="Digest sent" unread />
        <NotificationItem title="Run finished" />
      </NotificationBell>,
    );
    const [unread, read] = await screen.findAllByRole('listitem');
    expect(unread).toHaveTextContent('Unread: Digest sent');
    expect(unread.querySelector('.upmo-notification-item__dot')).toHaveAttribute('aria-hidden', 'true');
    expect(read).not.toHaveTextContent('Unread');
    expect(read.querySelector('.upmo-notification-item__dot')).toBeNull();
  });

  it('reads an unreadLabel in place of the English prefix', async () => {
    renderThemed(
      <NotificationBell count={1} defaultOpened>
        <NotificationItem title="Bericht gesendet" unread unreadLabel="Ungelesen: " />
      </NotificationBell>,
    );
    const item = await screen.findByRole('listitem');
    expect(item).toHaveTextContent('Ungelesen: Bericht gesendet');
    expect(item).not.toHaveTextContent('Unread');
  });

  it('holds an approve-only ApprovalCard', async () => {
    const onApprove = vi.fn();
    renderThemed(
      <NotificationBell count={1} defaultOpened>
        <NotificationItem title="Needs an answer" unread>
          <ApprovalCard action="Use the Q3 workbook?" onApprove={onApprove} />
        </NotificationItem>
      </NotificationBell>,
    );
    const group = await screen.findByRole('group', { name: 'Use the Q3 workbook?' });
    expect(within(group).queryByRole('button', { name: 'Deny' })).not.toBeInTheDocument();
    fireEvent.click(within(group).getByRole('button', { name: 'Approve' }));
    expect(onApprove).toHaveBeenCalledOnce();
  });
});
