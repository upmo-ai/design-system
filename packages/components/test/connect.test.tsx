import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ArtifactViewer,
  BrandMark,
  BrandTileGrid,
  ConnectorCard,
  ConnectWizard,
  ProviderCard,
  TestConnectionPanel,
  type Artifact,
} from '../src/index.ts';
import { aliases, marks } from '@upmo-ai/brands';
import { renderThemed, themes } from './render.tsx';

describe('BrandMark', () => {
  it('renders a known brand as an svg and an unknown one as a fallback', () => {
    const { container, rerender } = renderThemed(<BrandMark brand="github" />);
    expect(container.querySelector('svg')).toBeTruthy();
    rerender(<BrandMark brand="totally-unknown" kind="provider" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  // The markup of a mark, or of the fallback glyph, for comparing two ids.
  const html = (brand: string) => renderThemed(<BrandMark brand={brand} />).container.innerHTML;

  it.each([
    ['gemini', 'googlegemini'],
    ['google-calendar', 'googlecalendar'],
    ['google-cloud', 'googlecloud'],
    ['google-docs', 'googledocs'],
    ['google-drive', 'googledrive'],
    ['google-sheets', 'googlesheets'],
    ['microsoft-teams', 'microsoftteams'],
  ])('resolves the id "%s" to the %s mark', (alias, id) => {
    expect(marks[id]).toBeTruthy();
    expect(html(alias)).toBe(html(id));
    // It is the real mark, not the plug fallback.
    expect(html(alias)).toContain(marks[id]!.slice(0, 40));
  });

  it('looks aliases up case-insensitively, like ids', () => {
    expect(html('Google-Drive')).toBe(html('googledrive'));
    expect(html('  GEMINI ')).toBe(html('googlegemini'));
    expect(html('GitHub')).toBe(html('github'));
  });

  it('still falls back for unknown ids, including names on the object prototype', () => {
    const fallback = html('totally-unknown');
    expect(html('constructor')).toBe(fallback);
    expect(html('__proto__')).toBe(fallback);
    expect(Object.keys(aliases).every((alias) => html(alias) !== fallback)).toBe(true);
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

  it('names a tile by its brand alone and describes it with the adapter and description', () => {
    renderThemed(
      <BrandTileGrid
        items={[
          { id: 'openai', name: 'OpenAI', adapter: 'GPT', description: 'Hosted models' },
          { id: 'ollama', name: 'Ollama', adapter: 'Self-hosted' },
          { id: 'github', name: 'GitHub', description: 'Issues and PRs' },
          { id: 'slack', name: 'Slack' },
        ]}
        onSelect={() => {}}
      />,
    );
    // Exact-name lookups work: the adapter and description are not in the name.
    const openai = screen.getByRole('button', { name: 'OpenAI' });
    expect(openai).toHaveAccessibleDescription('GPT Hosted models');
    expect(screen.getByRole('button', { name: 'Ollama' })).toHaveAccessibleDescription('Self-hosted');
    expect(screen.getByRole('button', { name: 'GitHub' })).toHaveAccessibleDescription('Issues and PRs');
    // No adapter or description: no description at all.
    const slack = screen.getByRole('button', { name: 'Slack' });
    expect(slack).not.toHaveAttribute('aria-describedby');
    expect(slack).toHaveAccessibleDescription('');
    // The text stays visible.
    expect(screen.getByText('Hosted models')).toBeVisible();
  });

  it('keeps the selected state and click behaviour with the new naming', () => {
    const onSelect = vi.fn();
    renderThemed(
      <BrandTileGrid
        items={[{ id: 'openai', name: 'OpenAI', adapter: 'GPT' }]}
        selectedId="openai"
        onSelect={onSelect}
      />,
    );
    const tile = screen.getByRole('button', { name: 'OpenAI', pressed: true });
    fireEvent.click(tile);
    expect(onSelect).toHaveBeenCalledWith('openai');
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

  it('passes data-*, aria-* and other attributes to the root element', () => {
    const onClick = vi.fn();
    const { container } = renderThemed(
      <ConnectorCard
        id="github"
        name="GitHub"
        resourceScope="all"
        changes="ask"
        className="mine"
        data-testid="connector-github"
        role="group"
        aria-label="GitHub connector"
        onClick={onClick}
      />,
    );
    const root = screen.getByTestId('connector-github');
    expect(root).toBe(container.querySelector('.upmo-connector-card'));
    expect(root).toHaveAttribute('aria-label', 'GitHub connector');
    expect(root).toHaveClass('upmo-connector-card', 'mine');
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledOnce();
    // `id` is the connector id (the brand key), not a DOM id.
    expect(root).not.toHaveAttribute('id');
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

  it('passes data-*, aria-* and other attributes to the root element', () => {
    const { container } = renderThemed(
      <ProviderCard
        id="openai"
        name="OpenAI"
        status="Connected"
        planKind="metered"
        className="mine"
        data-testid="provider-openai"
        data-provider="openai"
        aria-label="OpenAI provider"
        role="group"
      />,
    );
    const root = screen.getByTestId('provider-openai');
    expect(root).toBe(container.querySelector('.upmo-provider-card'));
    expect(root).toHaveAttribute('data-provider', 'openai');
    expect(root).toHaveAttribute('aria-label', 'OpenAI provider');
    expect(screen.getByRole('group', { name: 'OpenAI provider' })).toBe(root);
    expect(root).toHaveClass('upmo-provider-card', 'mine');
    expect(root).not.toHaveAttribute('id');
  });
});

describe('ConnectWizard', () => {
  function wizard(onStepChange: (index: number) => void, disabledFirst = false) {
    return (
      <ConnectWizard
        active={2}
        onStepChange={onStepChange}
        steps={[
          { label: 'Service', content: <p>Pick one</p>, disabled: disabledFirst },
          { label: 'Credentials', content: <p>Keys</p> },
          { label: 'Scope', content: <p>Scope panel</p> },
        ]}
      />
    );
  }

  it('lets the user go back to an earlier step', () => {
    const onStepChange = vi.fn();
    renderThemed(wizard(onStepChange));
    fireEvent.click(screen.getByRole('button', { name: /Service/ }));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('does not select a disabled step, but keeps the others selectable', () => {
    const onStepChange = vi.fn();
    renderThemed(wizard(onStepChange, true));
    const locked = screen.getByRole('button', { name: /Service/ });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked).toHaveAttribute('tabindex', '-1');
    fireEvent.click(locked);
    expect(onStepChange).not.toHaveBeenCalled();
    const other = screen.getByRole('button', { name: /Credentials/ });
    expect(other).not.toHaveAttribute('aria-disabled');
    fireEvent.click(other);
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('still shows a disabled step in the stepper', () => {
    renderThemed(wizard(() => {}, true));
    expect(screen.getByText('Service')).toBeVisible();
    expect(screen.getByText('Scope panel')).toBeVisible();
  });

  it('never lets the user skip ahead, disabled or not', () => {
    const onStepChange = vi.fn();
    renderThemed(
      <ConnectWizard
        active={0}
        onStepChange={onStepChange}
        steps={[
          { label: 'Service', content: <p>a</p> },
          { label: 'Scope', content: <p>b</p>, disabled: false },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Scope/ }));
    expect(onStepChange).not.toHaveBeenCalled();
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
