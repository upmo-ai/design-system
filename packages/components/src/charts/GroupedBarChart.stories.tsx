import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupedBarChart, type BarGroup } from './GroupedBarChart.tsx';

const meta: Meta<typeof GroupedBarChart> = {
  title: 'Usage/GroupedBarChart',
  component: GroupedBarChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof GroupedBarChart>;

const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const outcomes: BarGroup[] = week.map((label, i) => ({
  label,
  bars: [
    { name: 'Passed', value: 30 + ((i * 11) % 40) },
    { name: 'Failed', value: 2 + ((i * 5) % 9) },
    { name: 'Cancelled', value: 1 + (i % 4) },
  ],
}));

export const RunOutcomes: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GroupedBarChart title="Run outcomes per day" groups={outcomes} />
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GroupedBarChart
        title="Run outcomes per day"
        groups={outcomes}
        orientation="horizontal"
        formatValue={(n) => `${n} runs`}
      />
    </div>
  ),
};

/** Five bars per group: the first three stay, the rest merge into Other in chart-mid. */
export const ManyBars: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GroupedBarChart
        title="Spend by connector per week"
        formatValue={(n) => `€${n}`}
        groups={['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, w) => ({
          label,
          bars: ['Email', 'Calendar', 'Files', 'Chat', 'Billing'].map((name, i) => ({
            name,
            value: 12 + ((w * 7 + i * 9) % 30),
          })),
        }))}
      />
    </div>
  ),
};

export const WithGaps: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GroupedBarChart
        title="Run outcomes per day"
        groups={outcomes.map((g, i) => ({
          ...g,
          bars: g.bars.map((b, j) => ({ ...b, value: (i + j) % 4 === 3 ? null : b.value })),
        }))}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GroupedBarChart title="Run outcomes per day" groups={[]} />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <GroupedBarChart title="Run outcomes per day" groups={outcomes} width={240} />
    </div>
  ),
};
