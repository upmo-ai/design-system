// Browser entry for the axis label checks in charts.browser.test.ts. It is
// bundled by esbuild and loaded into a real Chromium page; jsdom tests never
// import it.
//
// The charts that have axes (line, vertical and horizontal grouped bars, combo)
// plus the donut, which has none, all fed with dollar values like the Usage
// page's "Cost per task" chart. The caller's formatter is the long form
// ("US$1.50"); the charts keep it and thin the ticks instead.
// window.__AXES_SHORT__ (set before this script runs) draws the vertical-axis
// charts only 80 px tall.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ComboChart, DonutChart, GroupedBarChart, LineChart, UpmoProvider } from '../../src/index.ts';

declare global {
  interface Window {
    __AXES_SHORT__?: boolean;
  }
}

const usd = (n: number) => `US$${n.toFixed(2)}`;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const series = (name: string, values: (number | null)[]) => ({
  name,
  points: days.map((label, i) => ({ label, value: values[i] })),
});

const tasks = ['Summarise notes', 'Draft reply', 'Triage tickets', 'Weekly report'];
const taskCost = [
  [1.42, 0.31],
  [0.88, 0.2],
  [0.55, 0.12],
  [1.2, 0.46],
];

function Page() {
  const height = window.__AXES_SHORT__ ? 80 : undefined;
  return (
    <UpmoProvider theme="light" reducedMotion="reduce">
      <div id="chart-grid" style={{ padding: 16, display: 'grid', gap: 24 }}>
        <LineChart
          title="Cost per day"
          height={height}
          formatValue={usd}
          series={[
            series('Input', [0.2, 0.8, 0.5, 1.6, 1.1, 0.4, 0.6]),
            series('Output', [0.1, 0.4, null, 0.9, 0.7, 0.2, 0.3]),
          ]}
        />
        <GroupedBarChart
          title="Cost by weekday"
          height={height}
          formatValue={usd}
          groups={days.map((label, i) => ({
            label,
            bars: [
              { name: 'Input', value: 0.3 + ((i * 3) % 7) / 5 },
              { name: 'Output', value: 0.1 + (i % 3) / 5 },
            ],
          }))}
        />
        <GroupedBarChart
          title="Cost per task"
          orientation="horizontal"
          formatValue={usd}
          groups={tasks.map((label, i) => ({
            label,
            bars: [
              { name: 'Input', value: taskCost[i][0] },
              { name: 'Output', value: taskCost[i][1] },
            ],
          }))}
        />
        <ComboChart
          title="Spend and success rate"
          height={height}
          bars={series('Spend', [0.4, 0.63, 0.86, 0.49, 0.72, 1.45, 0.58])}
          line={series('Success rate', [92, 95, 97, 93, 96, 99, 94])}
          formatBar={usd}
          formatLine={(n) => `${Math.round(n)}%`}
        />
        <DonutChart
          title="Runs by model"
          centerLabel="Runs"
          data={[
            { label: 'Claude Sonnet', value: 640, display: '640 runs' },
            { label: 'Claude Haiku', value: 380, display: '380 runs' },
          ]}
        />
      </div>
    </UpmoProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
flushSync(() => root.render(<Page />));
