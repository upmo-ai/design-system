import { IconCheck } from '@tabler/icons-react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge, Button, IconButton, Spinner, TooltipGroup } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('Button', () => {
  it('renders its label and responds to clicks', () => {
    const onClick = vi.fn();
    renderThemed(<Button onClick={onClick}>Approve</Button>);
    const btn = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<Button>Approve</Button>, theme);
      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      unmount();
    }
  });

  it('can render as another element via the polymorphic component prop', () => {
    renderThemed(
      <Button component="a" href="/tasks">
        Tasks
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Tasks' });
    expect(link).toHaveAttribute('href', '/tasks');
  });

  it('defaults to the md size, the control-md height shared with inputs', () => {
    renderThemed(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-size', 'md');
  });
});

describe('IconButton', () => {
  it('requires and exposes an accessible name', () => {
    renderThemed(
      <IconButton aria-label="Send message">
        <IconCheck />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(
        <IconButton aria-label="Copy">
          <IconCheck />
        </IconButton>,
        theme,
      );
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
      unmount();
    }
  });

  it('shows its tooltip on keyboard focus', async () => {
    renderThemed(
      <IconButton aria-label="Refresh">
        <IconCheck />
      </IconButton>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Refresh');
  });

  it('stays focusable when disabled so its tooltip still shows, and ignores clicks', async () => {
    const onClick = vi.fn();
    renderThemed(
      <IconButton aria-label="Delete" disabled onClick={onClick}>
        <IconCheck />
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toHaveAttribute('data-disabled');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.focus(btn);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Delete');
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    renderThemed(
      <IconButton aria-label="Run" onClick={onClick}>
        <IconCheck />
      </IconButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('TooltipGroup', () => {
  it('wraps a row of icon buttons', async () => {
    renderThemed(
      <TooltipGroup>
        <IconButton aria-label="Run">
          <IconCheck />
        </IconButton>
        <IconButton aria-label="Stop">
          <IconCheck />
        </IconButton>
      </TooltipGroup>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'Stop' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Stop');
  });
});

describe('Badge', () => {
  it('renders its content', () => {
    renderThemed(<Badge>Working</Badge>);
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<Badge>Done</Badge>, theme);
      expect(screen.getByText('Done')).toBeInTheDocument();
      unmount();
    }
  });

  it('keeps sentence case, never uppercasing the label', () => {
    const { container } = renderThemed(<Badge>Rate limited</Badge>);
    const root = container.querySelector('.mantine-Badge-root') as HTMLElement;
    expect(root).toBeTruthy();
    // The Upmo badge carries the upmo-badge class and sets tt="none", which
    // Mantine renders as an inline text-transform, beating its default uppercase.
    expect(root.className).toContain('upmo-badge');
    expect(root.style.textTransform).toBe('none');
    expect(root.textContent).toBe('Rate limited');
  });
});

describe('Spinner', () => {
  it('exposes a default accessible label', () => {
    renderThemed(<Spinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    renderThemed(<Spinner label="Testing connection" />);
    expect(screen.getByLabelText('Testing connection')).toBeInTheDocument();
  });
});
