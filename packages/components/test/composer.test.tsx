import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Composer, type ComposerConfigMenu } from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

function config(overrides: Partial<ComposerConfigMenu> = {}): ComposerConfigMenu {
  return {
    label: 'Agent, route and model',
    groups: [
      {
        label: 'Agent',
        value: 'auto',
        onChange: () => {},
        options: [
          { value: 'auto', label: 'Auto', description: 'Picks the agent that fits the task.' },
          { value: 'finance', label: 'Finance' },
        ],
      },
      {
        label: 'Route',
        value: 'fast',
        onChange: () => {},
        options: [
          { value: 'default', label: 'Default' },
          { value: 'fast', label: 'Fast', description: 'Answers sooner, with less depth.' },
        ],
      },
      {
        label: 'Model',
        value: 'sonnet',
        onChange: () => {},
        options: [
          { value: 'sonnet', label: 'Claude Sonnet' },
          { value: 'opus', label: 'Claude Opus' },
        ],
      },
    ],
    ...overrides,
  };
}

function composer(props: Partial<Parameters<typeof Composer>[0]> = {}) {
  return <Composer value="" onChange={() => {}} onSend={() => {}} config={config()} {...props} />;
}

async function openGroup(name: string) {
  fireEvent.click(screen.getByRole('button', { name: /^Agent, route and model/ }));
  const item = await screen.findByRole('menuitem', { name });
  fireEvent.keyDown(item, { key: 'ArrowRight' });
  return item;
}

describe('Composer option details', () => {
  it('renders each option description and keeps the option name to its label', async () => {
    renderThemed(composer());
    await openGroup('Agent');
    const auto = await screen.findByRole('menuitemradio', { name: 'Auto' });
    expect(within(auto).getByText('Picks the agent that fits the task.')).toBeInTheDocument();
    expect(auto).toHaveAccessibleDescription('Picks the agent that fits the task.');
    // An option without a description has none to announce.
    const finance = screen.getByRole('menuitemradio', { name: 'Finance' });
    expect(finance).not.toHaveAttribute('aria-describedby');
    expect(finance).toHaveAccessibleDescription('');
  });

  it('renders descriptions in the tools menu too', async () => {
    renderThemed(
      <Composer
        value=""
        onChange={() => {}}
        onSend={() => {}}
        toolsMode={{
          value: 'auto',
          onChange: () => {},
          options: [
            { value: 'auto', label: 'Auto', description: 'Use tools when they help.' },
            { value: 'off', label: 'Disabled' },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tools mode: Auto' }));
    const auto = await screen.findByRole('menuitemradio', { name: 'Auto' });
    expect(auto).toHaveAccessibleDescription('Use tools when they help.');
    expect(screen.getByRole('menuitemradio', { name: 'Disabled' })).toBeInTheDocument();
  });

  it('shows the current value beside each group without changing the group name', async () => {
    renderThemed(composer());
    fireEvent.click(screen.getByRole('button', { name: /^Agent, route and model/ }));
    const agent = await screen.findByRole('menuitem', { name: 'Agent' });
    const route = screen.getByRole('menuitem', { name: 'Route' });
    const model = screen.getByRole('menuitem', { name: 'Model' });
    expect(agent).toHaveTextContent('AgentAuto');
    expect(route).toHaveTextContent('RouteFast');
    expect(model).toHaveTextContent('ModelClaude Sonnet');
    expect(agent).toHaveAccessibleDescription('Auto');
    expect(route).toHaveAccessibleDescription('Fast');
  });

  it('still selects an option through the menu', async () => {
    const onChange = vi.fn();
    const menu = config();
    menu.groups[0]!.onChange = onChange;
    renderThemed(composer({ config: menu }));
    await openGroup('Agent');
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Finance' }));
    expect(onChange).toHaveBeenCalledWith('finance');
  });
});

describe('Composer toolbar', () => {
  const fullName = 'Agent, route and model: Auto · Fast · Claude Sonnet';
  const fullSummary = 'Auto · Fast · Claude Sonnet';
  const compactName = 'Agent, route and model: Claude Sonnet';

  it('shows the full summary by default', () => {
    renderThemed(composer());
    const pill = screen.getByRole('button', { name: fullName });
    expect(pill).toHaveTextContent('Auto · Fast · Claude Sonnet');
  });

  it('shows the full summary for toolbar="full"', () => {
    renderThemed(composer({ toolbar: 'full' }));
    expect(screen.getByRole('button', { name: fullName })).toHaveTextContent('Auto · Fast · Claude Sonnet');
  });

  it('names the full pill by its label and summary, with nothing to describe', () => {
    renderThemed(composer());
    const pill = screen.getByRole('button', { name: fullName });
    expect(pill).not.toHaveAttribute('aria-describedby');
    expect(pill).toHaveAccessibleDescription('');
  });

  it('shows the compact summary when toolbar is compact, and names the pill from it', () => {
    renderThemed(composer({ toolbar: 'compact' }));
    const pill = screen.getByRole('button', { name: compactName });
    expect(pill).toHaveTextContent('Claude Sonnet');
    expect(pill).not.toHaveTextContent('Auto');
  });

  it('describes the compact pill with the full summary', () => {
    renderThemed(composer({ toolbar: 'compact' }));
    const pill = screen.getByRole('button', { name: compactName });
    expect(pill).toHaveAccessibleDescription(fullSummary);
    // The description is not part of the pill's own content.
    expect(pill).not.toHaveTextContent(fullSummary);
  });

  it('uses compactSummary for the compact pill when given, and names the pill from it', () => {
    renderThemed(composer({ toolbar: 'compact', config: config({ compactSummary: 'Sonnet, fast' }) }));
    const pill = screen.getByRole('button', { name: 'Agent, route and model: Sonnet, fast' });
    expect(pill).toHaveTextContent('Sonnet, fast');
    expect(pill).toHaveAccessibleDescription(fullSummary);
  });

  it('keeps the visible pill text inside its accessible name, for speech control', () => {
    for (const compactSummary of [undefined, 'Sonnet, fast']) {
      const { unmount } = renderThemed(composer({ toolbar: 'compact', config: config({ compactSummary }) }));
      const pill = screen.getByRole('button', { name: /^Agent, route and model/ });
      const visible = pill.querySelector('.upmo-composer__pill-text')!.textContent!;
      expect(visible).not.toBe('');
      expect(pill.getAttribute('aria-label')).toContain(visible);
      unmount();
    }
  });

  it('goes compact when the form is narrower than 420px and the toolbar is auto', async () => {
    const callbacks: ResizeObserverCallback[] = [];
    class MeasuringObserver {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', MeasuringObserver);
    try {
      renderThemed(composer());
      const form = screen.getByRole('form', { name: 'Chat composer' });
      const measure = (width: number) =>
        act(() => {
          for (const callback of callbacks) {
            callback(
              [
                {
                  target: form,
                  contentRect: { width, height: 120 },
                  borderBoxSize: [{ inlineSize: width, blockSize: 120 }],
                } as unknown as ResizeObserverEntry,
              ],
              {} as ResizeObserver,
            );
          }
        });
      measure(360);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: compactName })).toHaveTextContent(/^Claude Sonnet$/),
      );
      measure(640);
      await waitFor(() => expect(screen.getByRole('button', { name: fullName })).toHaveTextContent(fullSummary));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps send, attach and the tools pill in a compact toolbar', () => {
    renderThemed(
      composer({
        toolbar: 'compact',
        onAttach: () => {},
        onDictate: () => {},
        toolsMode: { value: 'auto', onChange: () => {}, options: [{ value: 'auto', label: 'Auto' }] },
      }),
    );
    expect(screen.getByRole('button', { name: 'Attach file' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tools mode: Auto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(composer({ toolbar: 'compact' }), theme);
      expect(screen.getByRole('button', { name: compactName })).toBeInTheDocument();
      unmount();
    }
  });
});
