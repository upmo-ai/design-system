import type { Meta, StoryObj } from '@storybook/react-vite';
import { DonutChart } from './DonutChart.tsx';

const meta: Meta<typeof DonutChart> = {
  title: 'Usage/DonutChart',
  component: DonutChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

export const RunsByModel: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DonutChart
        title="Runs by model"
        centerLabel="Runs"
        centerValue="1,284"
        data={[
          { label: 'Claude Sonnet', value: 640, display: '640 runs' },
          { label: 'Claude Haiku', value: 380, display: '380 runs' },
          { label: 'Nova Pro', value: 164, display: '164 runs' },
          { label: 'Llama 3', value: 100, display: '100 runs' },
        ]}
      />
    </div>
  ),
};

/** Eight slices: the first five stay, the rest merge into Other in chart-mid. */
export const ManySlices: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DonutChart
        title="Spend by connector"
        formatValue={(n) => `€${n}`}
        data={[48, 31, 22, 17, 11, 9, 6, 3].map((value, i) => ({ label: `Connector ${i + 1}`, value }))}
      />
    </div>
  ),
};

export const WithZeroSlice: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DonutChart
        title="Approvals"
        data={[
          { label: 'Approved', value: 52 },
          { label: 'Denied', value: 6 },
          { label: 'Expired', value: 0 },
        ]}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DonutChart
        title="Runs by model"
        data={[
          { label: 'Claude Sonnet', value: 0 },
          { label: 'Nova Pro', value: 0 },
        ]}
      />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <DonutChart
        title="Runs by model"
        data={[
          { label: 'Claude Sonnet', value: 640 },
          { label: 'Claude Haiku', value: 380 },
          { label: 'Nova Pro', value: 164 },
        ]}
      />
    </div>
  ),
};
