import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart, type LineSeries } from './LineChart.tsx';

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

const LENGTH = 14;
const wave = (name: string, base: number, amp: number, phase: number): LineSeries => ({
  name,
  points: Array.from({ length: LENGTH }, (_, i) => ({
    label: `D${i + 1}`,
    value: Math.max(0, Math.round(base + Math.sin(i / 2 + phase) * amp + i)),
  })),
});

const tokens = (): LineSeries[] => [
  wave('Input', 120, 40, 0),
  wave('Output', 60, 20, 1),
  wave('Tool definitions', 25, 8, 2),
];

const formatTokens = (n: number) => `${new Intl.NumberFormat('en').format(n)} tok`;

export const MultiSeries: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart title="Tokens per day" series={tokens()} formatValue={formatTokens} />
    </div>
  ),
};

export const Smooth: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart title="Tokens per day" series={tokens()} curve="smooth" area formatValue={formatTokens} />
    </div>
  ),
};

export const StackedAreas: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart title="Token consumption" series={tokens()} stacked curve="smooth" formatValue={formatTokens} />
    </div>
  ),
};

/** Eight series: the five with the highest maximum stay, the rest merge into Other in chart-mid. */
export const EightSeries: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart
        title="Runs per agent"
        series={Array.from({ length: 8 }, (_, i) => wave(`Agent ${i + 1}`, 10 + i * 9, 6, i))}
      />
    </div>
  ),
};

export const WithGaps: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart
        title="Latency by region"
        formatValue={(n) => `${n} ms`}
        series={[
          {
            name: 'Frankfurt',
            points: Array.from({ length: LENGTH }, (_, i) => ({
              label: `D${i + 1}`,
              value: i === 5 || i === 6 || i === 11 ? null : 120 + ((i * 17) % 40),
            })),
          },
          {
            name: 'Virginia',
            points: Array.from({ length: LENGTH }, (_, i) => ({
              label: `D${i + 1}`,
              value: i < 3 ? null : 90 + ((i * 13) % 30),
            })),
          },
        ]}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LineChart title="Tokens per day" series={[]} />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <LineChart title="Tokens per day" series={tokens()} formatValue={formatTokens} width={240} />
    </div>
  ),
};
