// Browser entry for chat-thread.browser.test.ts. It is bundled by esbuild and
// loaded into a real Chromium page; it is not imported by jsdom tests.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatMessage, ChatThread, UpmoProvider } from '../../src/index.ts';

const lines = (n: number) => Array.from({ length: n }, (_, i) => `Line ${i + 1} of the reply.`).join('\n');

function Page() {
  const [count, setCount] = useState(12);
  const [growth, setGrowth] = useState(0);
  const [sentKey, setSentKey] = useState(0);
  return (
    <UpmoProvider theme="light">
      <div style={{ display: 'flex', flexDirection: 'column', height: 400, width: 480 }}>
        <ChatThread scrollKey={sentKey}>
          {Array.from({ length: count }, (_, i) => (
            <ChatMessage
              key={i}
              role={i === count - 1 && growth > 0 ? 'assistant' : 'user'}
              content={i === count - 1 && growth > 0 ? lines(growth) : `Message ${i + 1}`}
            />
          ))}
        </ChatThread>
      </div>
      <button type="button" onClick={() => setCount((n) => n + 1)}>Add message</button>
      <button type="button" onClick={() => setGrowth((n) => n + 20)}>Grow last</button>
      <button type="button" onClick={() => { setCount((n) => n + 1); setSentKey((k) => k + 1); }}>Send</button>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
