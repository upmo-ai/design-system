// Browser entry for composer-toolbar.browser.test.ts. It is bundled by esbuild
// and loaded into a real Chromium page; it is not imported by jsdom tests.
//
// `window.upmoComposerToolbar` ('auto' | 'full' | 'compact') is read when the
// script runs, so the test can pick the toolbar before it mounts.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Composer, UpmoProvider } from '../../src/index.ts';

declare global {
  interface Window {
    upmoComposerToolbar?: 'auto' | 'full' | 'compact';
  }
}

function Page() {
  const [value, setValue] = useState('');
  const [agent, setAgent] = useState('auto');
  const [route, setRoute] = useState('default');
  const [model, setModel] = useState('sonnet');
  const [tools, setTools] = useState('auto');
  return (
    <UpmoProvider theme="light" reducedMotion="reduce">
      <div style={{ padding: 16 }}>
        <Composer
          value={value}
          onChange={setValue}
          onSend={() => setValue('')}
          onAttach={() => {}}
          onDictate={() => {}}
          toolbar={window.upmoComposerToolbar}
          config={{
            label: 'Agent, route and model',
            groups: [
              {
                label: 'Agent',
                value: agent,
                onChange: setAgent,
                options: [
                  { value: 'auto', label: 'Auto', description: 'Picks the agent that fits the task.' },
                  { value: 'finance', label: 'Finance', description: 'Invoices, refunds and reconciliation.' },
                ],
              },
              {
                label: 'Route',
                value: route,
                onChange: setRoute,
                options: [
                  { value: 'default', label: 'Default', description: 'Balanced speed and depth.' },
                  { value: 'fast', label: 'Fast', description: 'Answers sooner, with less depth.' },
                ],
              },
              {
                label: 'Model',
                value: model,
                onChange: setModel,
                options: [
                  { value: 'sonnet', label: 'Claude Sonnet', description: 'Everyday work.' },
                  { value: 'opus', label: 'Claude Opus', description: 'Hard problems and long documents.' },
                ],
              },
            ],
          }}
          toolsMode={{
            value: tools,
            onChange: setTools,
            options: [
              { value: 'auto', label: 'Auto' },
              { value: 'all', label: 'All tools' },
            ],
          }}
        />
      </div>
    </UpmoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
