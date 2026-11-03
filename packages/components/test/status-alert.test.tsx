import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusAlert, type StatusAlertTone } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('StatusAlert', () => {
  it('announces info, positive and attention politely and critical at once', () => {
    const roles: [StatusAlertTone, string][] = [
      ['info', 'status'],
      ['positive', 'status'],
      ['attention', 'status'],
      ['critical', 'alert'],
    ];
    for (const [tone, role] of roles) {
      const { unmount } = renderThemed(<StatusAlert tone={tone}>Message</StatusAlert>);
      expect(screen.getByRole(role), tone).toHaveTextContent('Message');
      unmount();
    }
  });

  it('lets the caller set the role', () => {
    renderThemed(
      <StatusAlert tone="attention" role="alert">
        Budget at 95%
      </StatusAlert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Budget at 95%');
  });

  it('never carries meaning by colour alone: every tone shows an icon', () => {
    for (const tone of ['info', 'positive', 'attention', 'critical'] as const) {
      const { container, unmount } = renderThemed(<StatusAlert tone={tone}>Message</StatusAlert>);
      expect(container.querySelector('.upmo-status-alert__icon svg'), tone).toBeTruthy();
      unmount();
    }
  });

  it('maps tones onto the status tone layer', () => {
    const tones: [StatusAlertTone, string][] = [
      ['info', 'upmo-tone-neutral'],
      ['positive', 'upmo-tone-positive'],
      ['attention', 'upmo-tone-attention'],
      ['critical', 'upmo-tone-critical'],
    ];
    for (const [tone, cls] of tones) {
      const { unmount } = renderThemed(<StatusAlert tone={tone}>Message</StatusAlert>);
      expect(screen.getByText('Message').closest('.upmo-status-alert'), tone).toHaveClass(cls);
      unmount();
    }
  });

  it('names the alert with its title and shows actions', () => {
    renderThemed(
      <StatusAlert tone="critical" title="Provider rejected the key" actions={<button type="button">Replace key</button>}>
        Anthropic answered 401.
      </StatusAlert>,
    );
    expect(screen.getByRole('alert', { name: 'Provider rejected the key' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace key' })).toBeInTheDocument();
  });

  it('has no close button unless dismissible, and a labelled one when it is', () => {
    const { unmount } = renderThemed(<StatusAlert>Saved.</StatusAlert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();

    const onDismiss = vi.fn();
    renderThemed(
      <StatusAlert onDismiss={onDismiss} dismissLabel="Dismiss message">
        Saved.
      </StatusAlert>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<StatusAlert tone="positive">Connector saved.</StatusAlert>, theme);
      expect(screen.getByRole('status')).toHaveTextContent('Connector saved.');
      unmount();
    }
  });
});
