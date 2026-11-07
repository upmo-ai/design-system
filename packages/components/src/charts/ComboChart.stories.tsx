import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComboChart } from './ComboChart.tsx';

const meta: Meta<typeof ComboChart> = {
  title: 'Usage/ComboChart',
  component: ComboChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ComboChart>;

const days = Array.from({ length: 10 }, (_, i) => `D${i + 1}`);
const runs = days.map((label, i) => ({ label, value: 40 + ((i * 23) % 60) }));
const rate = days.map((label, i) => ({ label, value: 92 + ((i * 7) % 8) }));

export const RunsAndSuccessRate: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ComboChart
        title="Runs and success rate"
        bars={{ name: 'Runs', points: runs }}
        line={{ name: 'Success rate', points: rate }}
        formatBar={(n) => `${n}`}
        formatLine={(n) => `${n}%`}
      />
    </div>
  ),
};

export const WithGaps: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ComboChart
        title="Runs and success rate"
        bars={{ name: 'Runs', points: runs.map((p, i) => (i === 3 ? { ...p, value: null } : p)) }}
        line={{ name: 'Success rate', points: rate.map((p, i) => (i === 5 || i === 6 ? { ...p, value: null } : p)) }}
        formatLine={(n) => `${n}%`}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ComboChart
        title="Runs and success rate"
        bars={{ name: 'Runs', points: [] }}
        line={{ name: 'Success rate', points: [] }}
      />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <ComboChart
        title="Runs and success rate"
        bars={{ name: 'Runs', points: runs }}
        line={{ name: 'Success rate', points: rate }}
        formatLine={(n) => `${n}%`}
        width={280}
      />
    </div>
  ),
};
