import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconMessages } from '@tabler/icons-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ChatMessage } from './ChatMessage.tsx';
import { ChatThread } from './ChatThread.tsx';
import { Composer } from './Composer.tsx';
import { EmptyState } from '../EmptyState/EmptyState.tsx';

const meta: Meta<typeof ChatThread> = {
  title: 'Agent surfaces/ChatThread',
  component: ChatThread,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ChatThread>;

/** The thread fills the height its parent gives it, so a story gives it one. */
function Frame({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', height: 420, maxWidth: 560 }}>{children}</div>;
}

const history = Array.from({ length: 8 }, (_, i) => [
  <ChatMessage key={`u${i}`} role="user" content={`Question ${i + 1}: how many invoices are still open?`} />,
  <ChatMessage
    key={`a${i}`}
    role="assistant"
    content={`Answer ${i + 1}: 142 invoices are open and 4 are unmatched.`}
    model="Claude Sonnet"
    tokens={212}
    duration="1.4 s"
  />,
]).flat();

export const Default: Story = {
  render: () => (
    <Frame>
      <ChatThread>{history}</ChatThread>
    </Frame>
  ),
};

export const Empty: Story = {
  render: () => (
    <Frame>
      <ChatThread
        empty={
          <EmptyState
            compact
            icon={<IconMessages size={20} />}
            title="Start a chat"
            description="Ask the finance agent about invoices, payments or the close."
          />
        }
      />
    </Frame>
  ),
};

/** A reply streams in. The thread follows it while you are at the newest message. */
export const Streaming: Story = {
  render: () => {
    const words = 'I reconciled 138 of 142 invoices against the payments. Four are unmatched, so I will flag those for review and leave the rest posted. '.repeat(6).split(' ');
    const [count, setCount] = useState(1);
    useEffect(() => {
      const id = setInterval(() => setCount((n) => (n < words.length ? n + 1 : n)), 120);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const done = count >= words.length;
    return (
      <Frame>
        <ChatThread
          busy={!done}
          announcement={done ? 'Upmo replied: the reconciliation is finished.' : undefined}
        >
          {history.slice(0, 4)}
          <ChatMessage role="assistant" content={words.slice(0, count).join(' ')} streaming={!done} model="Claude Sonnet" />
        </ChatThread>
      </Frame>
    );
  },
};

/** Scroll up and the thread stays put and offers "Jump to newest". Sending a message returns to the newest. */
export const ScrolledUp: Story = {
  play: async ({ canvasElement }) => {
    const log = canvasElement.querySelector('[role="log"]');
    if (log) log.scrollTop = 0;
  },
  render: () => {
    const [sent, setSent] = useState<string[]>([]);
    const [draft, setDraft] = useState('');
    return (
      <Frame>
        <ChatThread scrollKey={sent.length}>
          {history}
          {sent.map((text, i) => (
            <ChatMessage key={i} role="user" content={text} />
          ))}
        </ChatThread>
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => {
            setSent((prev) => [...prev, draft]);
            setDraft('');
          }}
        />
      </Frame>
    );
  },
};
