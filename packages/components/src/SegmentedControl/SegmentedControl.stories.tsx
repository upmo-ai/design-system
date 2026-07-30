import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl.tsx';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Controls/SegmentedControl',
  component: SegmentedControl,
  args: {
    data: ['Live', 'Paused', 'All'],
    defaultValue: 'Live',
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Playground: Story = {};
