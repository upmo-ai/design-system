import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ArtifactViewer,
  BrandMark,
  BrandTileGrid,
  ConnectorCard,
  ProviderCard,
  TestConnectionPanel,
  type Artifact,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('BrandMark', () => {
  it('renders a known brand as an svg and an unknown one as a fallback', () => {
    const { container, rerender } = renderThemed(<BrandMark brand="github" />);
    expect(container.querySelector('svg')).toBeTruthy();
    rerender(<BrandMark brand="totally-unknown" kind="provider" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('BrandTileGrid', () => {
  it('marks the selected tile and fires onSelect', () => {
    const onSelect = vi.fn();
    renderThemed(
      <BrandTileGrid
        items={[
          { id: 'github', name: 'GitHub' },
          { id: 'slack', name: 'Slack' },
        ]}
        selectedId="github"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole('button', { name: /GitHub/, pressed: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Slack/ }));
    expect(onSelect).toHaveBeenCalledWith('slack');
  });
});

describe('TestConnectionPanel', () => {
  it('shows each state title and fires onTest', () => {
    const onTest = vi.fn();
    const { rerender } = renderThemed(<TestConnectionPanel state="idle" onTest={onTest} />);
    expect(screen.getByText('Ready to test')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Test connection' }));
    expect(onTest).toHaveBeenCalledOnce();
    rerender(<TestConnectionPanel state="success" latencyMs={120} onTest={onTest} />);
    expect(screen.getByText('Connection verified')).toBeInTheDocument();
    expect(screen.getByText(/120 ms/)).toBeInTheDocument();
    rerender(<TestConnectionPanel state="error" error="nope" onTest={onTest} />);
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText('nope')).toBeInTheDocument();
  });
});

describe('ConnectorCard', () => {
  it('shows name, policy and actions', () => {
    const onDisconnect = vi.fn();
    renderThemed(
      <ConnectorCard
        id="github"
        name="GitHub"
        resourceScope="all"
        changes="ask"
        onEdit={() => {}}
        onDisconnect={onDisconnect}
      />,
    );
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Ask first')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(onDisconnect).toHaveBeenCalledOnce();
  });
});

describe('ProviderCard', () => {
  it('shows the status and models', () => {
    renderThemed(
      <ProviderCard id="openai" name="OpenAI" status="Rate limited" planKind="metered" models={['gpt-5']} />,
    );
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Rate limited')).toBeInTheDocument();
    expect(screen.getByText('gpt-5')).toBeInTheDocument();
  });
});

describe('ArtifactViewer', () => {
  const artifacts: Artifact[] = [
    { id: 'a', name: 'summary.md', kind: 'markdown', content: '## Title\n\nBody text.' },
    { id: 'b', name: 'data.csv', kind: 'csv', content: 'x,y\n1,2\n3,4' },
  ];

  it('lists artifacts and shows the first by default', () => {
    renderThemed(<ArtifactViewer artifacts={artifacts} />);
    expect(screen.getByRole('tab', { name: /summary.md/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('switches to a CSV artifact and renders a table', () => {
    renderThemed(<ArtifactViewer artifacts={artifacts} />);
    fireEvent.click(screen.getByRole('tab', { name: /data.csv/ }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows an empty state when there are no artifacts', () => {
    renderThemed(<ArtifactViewer artifacts={[]} />);
    expect(screen.getByText('No artifacts yet')).toBeInTheDocument();
  });

  it('mounts in every theme', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<ArtifactViewer artifacts={artifacts} />, theme);
      unmount();
    }
  });
});
