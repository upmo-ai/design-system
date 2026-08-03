import type { Meta, StoryObj } from '@storybook/react-vite';
import { TaskHeader } from './TaskHeader.tsx';

const meta: Meta<typeof TaskHeader> = {
  title: 'Agent surfaces/TaskHeader',
  component: TaskHeader,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof TaskHeader>;

export const Working: Story = {
  render: () => (
    <TaskHeader
      title="Invoice sync"
      status="Working"
      meta={{ runNumber: 14, engine: 'Upmo', model: 'Claude Sonnet', startedAt: '08:00', cost: '€2.10' }}
      detail="Reconcile open invoices against payments and flag the unmatched ones."
      paused={false}
      onTogglePause={() => {}}
      canAdvance
      onNextPhase={() => {}}
      onShare={() => {}}
    />
  ),
};

export const NeedsApproval: Story = {
  render: () => (
    <TaskHeader
      title="Daily digest"
      status="Needs approval"
      meta={{ runNumber: 7, model: 'Claude Opus', startedAt: '09:15', cost: '€0.80' }}
      onTogglePause={() => {}}
      onNextPhase={() => {}}
      onShare={() => {}}
    />
  ),
};
