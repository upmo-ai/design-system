import type { Meta, StoryObj } from '@storybook/react-vite';
import { SetupChecklist } from './SetupChecklist.tsx';

const meta: Meta<typeof SetupChecklist> = {
  title: 'Onboarding/SetupChecklist',
  component: SetupChecklist,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof SetupChecklist>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <SetupChecklist
        steps={[
          { id: '1', title: 'Connect a provider', description: 'Add a model provider to run agents.', done: true },
          { id: '2', title: 'Create a workspace', description: 'A home for your agents.', done: true },
          { id: '3', title: 'Deploy your first agent', description: 'Pick a template or start fresh.', actionLabel: 'Deploy', onAction: () => {} },
          { id: '4', title: 'Invite your team', description: 'Share the control room.', actionLabel: 'Invite', onAction: () => {} },
        ]}
      />
    </div>
  ),
};
