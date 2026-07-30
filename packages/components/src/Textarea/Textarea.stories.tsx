import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea.tsx';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    label: 'Instructions',
    placeholder: 'Describe what the agent should do...',
    description: 'Autosizes up to 8 rows, then scrolls.',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

export const Error: Story = {
  args: { error: 'Instructions are required.' },
};
