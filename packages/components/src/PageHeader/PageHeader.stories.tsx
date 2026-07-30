import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader.tsx';
import { Button } from '../Button/Button.tsx';

const meta: Meta<typeof PageHeader> = {
  title: 'Compositions/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Agents',
    description: 'Everything your workforce is doing right now.',
    actions: <Button>Deploy agent</Button>,
  },
};
