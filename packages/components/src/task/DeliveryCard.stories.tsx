import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeliveryCard } from './DeliveryCard.tsx';

const meta: Meta<typeof DeliveryCard> = {
  title: 'Agent surfaces/DeliveryCard',
  component: DeliveryCard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DeliveryCard>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <DeliveryCard channel="#finance on Slack" when="After the task is done" onEdit={() => {}} />
    </div>
  ),
};
