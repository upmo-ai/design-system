import type { Meta, StoryObj } from '@storybook/react-vite';
import { SimpleGrid } from '@mantine/core';
import { ProviderCard } from './ProviderCard.tsx';

const meta: Meta<typeof ProviderCard> = {
  title: 'Agent surfaces/ProviderCard',
  component: ProviderCard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ProviderCard>;

export const Grid: Story = {
  render: () => (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <ProviderCard
        id="anthropic"
        name="Anthropic"
        adapter="Claude"
        status="Connected"
        planKind="metered"
        models={['claude-sonnet', 'claude-opus']}
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ProviderCard
        id="openai"
        name="OpenAI"
        adapter="GPT"
        status="Rate limited"
        planKind="metered"
        models={['gpt-5']}
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ProviderCard
        id="ollama"
        name="Local Ollama"
        adapter="Self-hosted"
        status="Offline"
        planKind="local"
        baseUrl="http://localhost:11434"
        models={['llama-3']}
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ProviderCard
        id="openai"
        name="OpenAI (backup)"
        adapter="GPT"
        status="Key rejected"
        planKind="metered"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
    </SimpleGrid>
  ),
};

/**
 * The card at 320px (288px of content), the width of a three-column grid. The
 * longest status, "Not connected", keeps its width, a long name wraps beside
 * it, and Edit and Disconnect sit on one row.
 */
export const NarrowCard: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <ProviderCard
        id="anthropic"
        name="Anthropic"
        adapter="Anthropic (Claude)"
        status="Not connected"
        planKind="metered"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ProviderCard
        id="openai"
        name="A very long provider name that has to wrap"
        adapter="OpenAI (GPT)"
        status="Rate limited"
        planKind="metered"
        models={['gpt-5']}
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
    </div>
  ),
};

/** Extra attributes (data-*, aria-*) reach the root element. */
export const WithAttributes: Story = {
  render: () => (
    <ProviderCard
      id="gemini"
      name="Gemini"
      adapter="Google"
      status="Connected"
      planKind="metered"
      data-testid="provider-gemini"
      aria-label="Gemini provider"
      role="group"
    />
  ),
};
