import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button.tsx';
import { Tooltip } from './Tooltip.tsx';

const meta: Meta<typeof Tooltip> = {
  title: 'Controls/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip label="Runs the agent once, now">
      <Button variant="default">Run once</Button>
    </Tooltip>
  ),
};
