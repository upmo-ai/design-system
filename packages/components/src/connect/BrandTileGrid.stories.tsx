import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BrandTileGrid } from './BrandTileGrid.tsx';

const meta: Meta<typeof BrandTileGrid> = {
  title: 'Agent surfaces/BrandTileGrid',
  component: BrandTileGrid,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BrandTileGrid>;

/**
 * The pick-a-service step. Each tile is named by its brand alone; the adapter
 * and description are read as its description, so a screen reader announces
 * "OpenAI, button, pressed" first and the detail after.
 */
export const Providers: Story = {
  render: () => {
    const [selected, setSelected] = useState('openai');
    return (
      <BrandTileGrid
        kind="provider"
        selectedId={selected}
        onSelect={setSelected}
        items={[
          { id: 'openai', name: 'OpenAI', adapter: 'GPT', description: 'Hosted models, metered by token.' },
          { id: 'anthropic', name: 'Anthropic', adapter: 'Claude', description: 'Hosted models, metered by token.' },
          { id: 'gemini', name: 'Gemini', adapter: 'Google', description: 'Hosted models, metered by token.' },
          { id: 'ollama', name: 'Ollama', adapter: 'Self-hosted' },
        ]}
      />
    );
  },
};

/** Connector tiles. Alternative ids such as google-drive resolve to the right mark. */
export const Connectors: Story = {
  render: () => {
    const [selected, setSelected] = useState('github');
    return (
      <BrandTileGrid
        selectedId={selected}
        onSelect={setSelected}
        items={[
          { id: 'github', name: 'GitHub', description: 'Issues and PRs' },
          { id: 'slack', name: 'Slack', description: 'Channels and messages' },
          { id: 'google-drive', name: 'Google Drive', description: 'Files and folders' },
          { id: 'google-calendar', name: 'Google Calendar', description: 'Events and invites' },
        ]}
      />
    );
  },
};
