import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatMessage, Composer, ToolCallTrace } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('Composer', () => {
  it('sends on Enter and not on Shift+Enter', () => {
    const onSend = vi.fn();
    renderThemed(<Composer value="hello" onChange={() => {}} onSend={onSend} />);
    const input = screen.getByLabelText('Message');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('disables send and suppresses Enter when the draft is empty', () => {
    const onSend = vi.fn();
    renderThemed(<Composer value="   " onChange={() => {}} onSend={onSend} />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('renders attach and dictate only when handlers are given', () => {
    const { rerender } = renderThemed(<Composer value="x" onChange={() => {}} onSend={() => {}} />);
    expect(screen.queryByLabelText('Attach file')).not.toBeInTheDocument();
    rerender(<Composer value="x" onChange={() => {}} onSend={() => {}} onAttach={() => {}} onDictate={() => {}} />);
    expect(screen.getByLabelText('Attach file')).toBeInTheDocument();
    expect(screen.getByLabelText('Dictate')).toBeInTheDocument();
  });
});

describe('ChatMessage', () => {
  it('renders user content and meta', () => {
    renderThemed(<ChatMessage role="user" content="Do the thing" tokens={12} cost="$0.001" />);
    expect(screen.getByText('Do the thing')).toBeInTheDocument();
    expect(screen.getByText('12 tokens · $0.001')).toBeInTheDocument();
  });

  it('renders assistant meta and a copy action', () => {
    renderThemed(<ChatMessage role="assistant" content="Done." model="Claude Sonnet" tokens={200} duration="1.4 s" cost="$0.01" />);
    expect(screen.getByText(/Claude Sonnet · 200 tokens · 1.4 s · \$0.01/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy reply/i })).toBeInTheDocument();
  });

  it('renders a system note', () => {
    renderThemed(<ChatMessage role="system" content="Agent started." />);
    expect(screen.getByText('Agent started.')).toBeInTheDocument();
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<ChatMessage role="assistant" content="hi" />, theme);
      unmount();
    }
  });
});

describe('ToolCallTrace', () => {
  it('shows the name and status word, collapsed by default', () => {
    renderThemed(<ToolCallTrace name="send_invoice" status="success" result={{ ok: true }} />);
    expect(screen.getByText('send_invoice')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    // Collapsed: the result JSON is not shown.
    expect(screen.queryByText(/Result/)).not.toBeInTheDocument();
  });

  it('toggles the body open to reveal args and result', () => {
    renderThemed(<ToolCallTrace name="t" status="success" args={{ a: 1 }} result={{ b: 2 }} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText('Arguments')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
  });

  it('shows the error when status is error', () => {
    renderThemed(<ToolCallTrace name="t" status="error" error="boom" defaultOpen />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
