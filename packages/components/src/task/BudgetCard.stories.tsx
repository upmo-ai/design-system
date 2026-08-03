import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '@mantine/core';
import { BudgetCard } from './BudgetCard.tsx';

const meta: Meta<typeof BudgetCard> = {
  title: 'Agent surfaces/BudgetCard',
  component: BudgetCard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BudgetCard>;

export const Thresholds: Story = {
  render: () => (
    <Group align="flex-start" gap="md">
      <div style={{ width: 240 }}>
        <BudgetCard percent={42} cost="€2.10" limit="€5.00" tokens={38000} pauseAt={90} onEdit={() => {}} usageHref="#" />
      </div>
      <div style={{ width: 240 }}>
        <BudgetCard percent={76} cost="€3.80" limit="€5.00" tokens={71000} pauseAt={90} onEdit={() => {}} />
      </div>
      <div style={{ width: 240 }}>
        <BudgetCard percent={94} cost="€4.70" limit="€5.00" tokens={88000} pauseAt={90} onEdit={() => {}} />
      </div>
    </Group>
  ),
};
