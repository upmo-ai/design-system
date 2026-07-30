import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select.tsx';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  args: {
    label: 'Model',
    placeholder: 'Pick a model',
    data: [
      { value: 'sonnet', label: 'Claude Sonnet' },
      { value: 'opus', label: 'Claude Opus' },
      { value: 'haiku', label: 'Claude Haiku' },
    ],
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const Searchable: Story = {
  args: {
    searchable: true,
    description: 'Search is recommended above ~10 options.',
  },
};
