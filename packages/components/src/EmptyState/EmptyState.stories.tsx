import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconListCheck } from '@tabler/icons-react';
import { EmptyState } from './EmptyState.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof EmptyState> = {
  title: 'Compositions/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<IconListCheck size={24} />}
      title="No runs yet"
      description="When your agent starts working, its runs will show up here."
      action={<Button>Deploy first agent</Button>}
    />
  ),
};

export const FirstRun: Story = {
  render: () => (
    <EmptyState
      firstRun
      icon={<IconListCheck size={24} />}
      title="Create your first workspace"
      description="A workspace is where your agents live and share context."
      action={<Button>New workspace</Button>}
    />
  ),
};

export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: 320, border: '1px solid var(--border)' }}>
      <EmptyState
        compact
        icon={<IconListCheck size={20} />}
        title="You are all caught up"
        description="Nothing needs your attention."
      />
    </div>
  ),
};

/** The title is an h5 here and looks the same as the default. */
export const HeadingLevel: Story = {
  render: () => <EmptyState headingLevel={5} title="No runs yet" description="Runs show up here once your agent starts." />,
};
