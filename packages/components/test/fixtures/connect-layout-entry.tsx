// Browser entry for connect-layout.browser.test.ts. It is bundled by esbuild
// and loaded into a real Chromium page; it is not imported by jsdom tests.
//
// `window.upmoScene(name, width)` mounts one scene inside a box of the given
// width, so the test can measure a card at the width the Upmo app gives it (a
// card is 320px wide, 288px of content, in a three-column grid).
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';
import {
  BrandTileGrid,
  ConnectorCard,
  ProviderCard,
  TestConnectionPanel,
  UpmoProvider,
  type ProviderStatus,
} from '../../src/index.ts';

const noop = () => {};

const tiles = [
  { id: 'github', name: 'GitHub', description: 'Repositories, issues and pull requests' },
  { id: 'notion', name: 'Notion', description: 'Pages, databases and workspaces' },
  { id: 'slack', name: 'Slack', description: 'Workspaces, channels and messaging' },
];

function scene(name: string): ReactNode {
  switch (name) {
    case 'connector':
      return (
        <ConnectorCard
          id="github"
          name="GitHub"
          description="Repositories, issues and pull requests"
          resourceScope="these"
          resourceIds={['upmo/web', 'upmo/brain']}
          changes="ask"
          onEdit={noop}
          onDisconnect={noop}
          data-testid="card"
        />
      );
    case 'connector-long':
      return (
        <ConnectorCard
          id="github"
          name="A very long connector name that cannot possibly fit next to the status"
          description="Repositories, issues and pull requests across every organisation you belong to"
          resourceScope="all"
          changes="allow"
          onEdit={noop}
          onDisconnect={noop}
          data-testid="card"
        />
      );
    case 'provider-connected':
    case 'provider-not-connected':
    case 'provider-rate-limited':
    case 'provider-key-rejected': {
      const status = {
        'provider-connected': 'Connected',
        'provider-not-connected': 'Not connected',
        'provider-rate-limited': 'Rate limited',
        'provider-key-rejected': 'Key rejected',
      }[name] as ProviderStatus;
      return (
        <ProviderCard
          id="anthropic"
          name="Anthropic"
          adapter="Anthropic (Claude)"
          status={status}
          planKind="metered"
          models={['claude-sonnet']}
          onEdit={noop}
          onDisconnect={noop}
          data-testid="card"
        />
      );
    }
    case 'provider-long':
      return (
        <ProviderCard
          id="anthropic"
          name="A very long provider name that cannot possibly fit next to the status"
          adapter="A long adapter label that also has to wrap"
          status="Not connected"
          planKind="metered"
          onEdit={noop}
          onDisconnect={noop}
          data-testid="card"
        />
      );
    case 'brandgrid':
      return <BrandTileGrid items={tiles} selectedId="notion" onSelect={noop} />;
    case 'testconn':
      return <TestConnectionPanel state="success" latencyMs={128} onTest={noop} />;
    case 'testconn-full':
      return (
        <TestConnectionPanel
          state="success"
          latencyMs={128}
          onTest={noop}
          className="upmo-testconn--full-width"
        />
      );
    default:
      throw new Error(`Unknown scene: ${name}`);
  }
}

let root: Root | undefined;

(
  window as unknown as { upmoScene: (name: string, width: number, theme?: 'light' | 'dark') => void }
).upmoScene = (name, width, theme = 'light') => {
  const host = document.getElementById('root')!;
  root?.unmount();
  root = createRoot(host);
  root.render(
    <UpmoProvider theme={theme} reducedMotion="reduce">
      <div id="box" style={{ width, boxSizing: 'border-box' }}>
        {scene(name)}
      </div>
    </UpmoProvider>,
  );
};
