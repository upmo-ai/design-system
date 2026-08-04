import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from './LineChart.tsx';

const meta: Meta<typeof LineChart> = {
  title: 'Usage/LineChart',
  component: LineChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

export const CostOverTime: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <LineChart
        title="Spend over the last 14 days"
        data={Array.from({ length: 14 }, (_, i) => ({
          label: `D${i + 1}`,
          value: Math.round(10 + Math.sin(i / 2) * 6 + i),
        }))}
      />
    </div>
  ),
};
