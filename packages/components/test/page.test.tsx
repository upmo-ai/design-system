import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, Dialog, PageHeader, PageShell } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('PageHeader', () => {
  it('renders an h1 title, description and actions', () => {
    renderThemed(
      <PageHeader
        title="Providers"
        description="Connect the model providers your agents use."
        actions={<button type="button">New provider</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Providers' })).toBeInTheDocument();
    expect(screen.getByText('Connect the model providers your agents use.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New provider' })).toBeInTheDocument();
  });
});

describe('PageShell', () => {
  it('renders the header and the content', () => {
    renderThemed(
      <PageShell header={{ title: 'Tasks' }}>
        <div>Task list</div>
      </PageShell>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByText('Task list')).toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <PageShell header={{ title: 'Usage' }}>
          <div>Body</div>
        </PageShell>,
        theme,
      );
      expect(screen.getByRole('heading', { level: 1, name: 'Usage' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    renderThemed(
      <ConfirmDialog opened={false} title="Remove?" body="Gone." action="Remove" onClose={() => {}} onConfirm={() => {}} />,
    );
    expect(screen.queryByText('Gone.')).not.toBeInTheDocument();
  });

  it('shows the title, body, named action and a cancel, and fires callbacks', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderThemed(
      <ConfirmDialog
        opened
        title="Remove member?"
        body="Alex will lose access to this workspace."
        action="Remove member"
        onClose={onClose}
        onConfirm={onConfirm}
        destructive
      />,
    );
    expect(screen.getByText('Alex will lose access to this workspace.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove member' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows progress on confirm and disables cancel while busy', () => {
    renderThemed(
      <ConfirmDialog opened title="Remove?" body="Gone." action="Remove" busy onClose={() => {}} onConfirm={() => {}} />,
    );
    const confirm = screen.getByRole('button', { name: 'Remove' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('data-loading');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('uses the library Button for both actions', () => {
    renderThemed(
      <ConfirmDialog opened title="Remove?" body="Gone." action="Remove" onClose={() => {}} onConfirm={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass('upmo-button');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('upmo-button');
  });

  it('lands initial focus on Cancel for a destructive confirm', async () => {
    renderThemed(
      <ConfirmDialog
        opened
        destructive
        title="Delete workspace?"
        body="This cannot be undone."
        action="Delete workspace"
        onClose={() => {}}
        onConfirm={() => {}}
      >
        <input aria-label="Workspace name" />
      </ConfirmDialog>,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('closes through the Modal rather than unmounting it', async () => {
    const props = { title: 'Remove?', body: 'Gone.', action: 'Remove', onClose: () => {}, onConfirm: () => {} };
    const { rerender } = renderThemed(<ConfirmDialog opened {...props} />);
    expect(screen.getByText('Gone.')).toBeInTheDocument();
    rerender(<ConfirmDialog opened={false} {...props} />);
    await waitFor(() => expect(screen.queryByText('Gone.')).not.toBeInTheDocument());
  });
});

describe('Dialog', () => {
  it('renders its title and body when open', () => {
    renderThemed(
      <Dialog opened onClose={() => {}} title="Share task">
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(screen.getByText('Share task')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });
});
