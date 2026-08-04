import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from './BarChart.tsx';

const meta: Meta<typeof BarChart> = {
  title: 'Usage/BarChart',
  component: BarChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const RunsPerDay: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <BarChart
        title="Runs per day"
        data={[
          { label: 'Mon', value: 42 },
          { label: 'Tue', value: 58 },
          { label: 'Wed', value: 71 },
          { label: 'Thu', value: 50 },
          { label: 'Fri', value: 88 },
          { label: 'Sat', value: 24 },
          { label: 'Sun', value: 12 },
        ]}
      />
    </div>
  ),
};
