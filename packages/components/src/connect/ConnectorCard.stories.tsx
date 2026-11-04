import type { Meta, StoryObj } from '@storybook/react-vite';
import { SimpleGrid } from '@mantine/core';
import { ConnectorCard } from './ConnectorCard.tsx';

const meta: Meta<typeof ConnectorCard> = {
  title: 'Agent surfaces/ConnectorCard',
  component: ConnectorCard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ConnectorCard>;

export const Grid: Story = {
  render: () => (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <ConnectorCard
        id="github"
        name="GitHub"
        description="Issues, PRs and repositories."
        resourceScope="these"
        resourceIds={['upmo-ai/web', 'upmo-ai/brain']}
        changes="ask"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ConnectorCard
        id="slack"
        name="Slack"
        description="Channels and messages."
        resourceScope="all"
        changes="allow"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ConnectorCard
        id="stripe"
        name="Stripe"
        description="Payments and invoices."
        resourceScope="all"
        changes="block"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
    </SimpleGrid>
  ),
};

/**
 * The card at the width the Upmo app gives it in a three-column grid: 320px, so
 * 288px of content. The Connected badge keeps its width, a long title wraps
 * beside it, and Edit permissions and Disconnect sit on one row. The browser
 * suite measures this layout.
 */
export const NarrowCard: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <ConnectorCard
        id="github"
        name="GitHub"
        description="Repositories, issues and pull requests"
        resourceScope="these"
        resourceIds={['upmo/web', 'upmo/brain']}
        changes="ask"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
      <ConnectorCard
        id="mcp"
        name="A very long connector name that has to wrap"
        description="Model Context Protocol endpoint"
        resourceScope="all"
        changes="allow"
        onEdit={() => {}}
        onDisconnect={() => {}}
      />
    </div>
  ),
};

/** Extra attributes (data-*, aria-*) reach the root element. */
export const WithAttributes: Story = {
  render: () => (
    <ConnectorCard
      id="google-drive"
      name="Google Drive"
      description="Files and folders."
      resourceScope="all"
      changes="ask"
      data-testid="connector-google-drive"
      aria-label="Google Drive connector"
      role="group"
    />
  ),
};
