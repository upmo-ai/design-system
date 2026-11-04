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
