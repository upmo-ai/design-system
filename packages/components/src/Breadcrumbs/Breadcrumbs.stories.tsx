import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs.tsx';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Compositions/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Workspaces', href: '#' },
      { label: 'Acme production', href: '#' },
      { label: 'Invoice sync' },
    ],
  },
};
