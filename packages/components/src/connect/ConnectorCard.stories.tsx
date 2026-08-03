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
