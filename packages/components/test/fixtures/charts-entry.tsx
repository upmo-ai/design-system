// Browser entry for charts.browser.test.ts. It is bundled by esbuild and loaded
// into a real Chromium page; it is not imported by jsdom tests.
//
// The four ECharts-backed charts, each in a box up to 560 px wide. The theme comes from
// window.__CHART_THEME__ and window.__CHARTS_HIDDEN__ starts them in a display: none box
// (both set before this script runs). It records when the
// first chart is drawn and the plot heights before and after, so the test can
// check that nothing jumps when ECharts arrives.
import '@mantine/core/styles.css';
import '@upmo-ai/tokens/tokens.css';
import '../../src/styles.css';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ComboChart, DonutChart, GroupedBarChart, LineChart, UpmoProvider } from '../../src/index.ts';

type Theme = 'light' | 'dark' | 'hc';

declare global {
  interface Window {
    __CHART_THEME__?: Theme;
    /** Mount the charts inside a display: none box; the test shows it with #chart-grid. */
    __CHARTS_HIDDEN__?: boolean;
    __chartStats?: {
      start: number;
      firstReady: number | null;
      allReady: number | null;
      firstPaint: number | null;
      heightsBefore: number[];
    };
  }
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const series = (name: string, values: (number | null)[]) => ({
  name,
  points: days.map((label, i) => ({ label, value: values[i] })),
});

function Page() {
  return (
    <UpmoProvider theme={window.__CHART_THEME__ ?? 'light'} reducedMotion="reduce">
      <div
        id="chart-grid"
        style={{ padding: 16, display: window.__CHARTS_HIDDEN__ ? 'none' : 'grid', gap: 24, maxWidth: 560 }}
      >
        <LineChart
          title="Tokens per day"
          formatValue={(n) => `${new Intl.NumberFormat('en').format(n)} tok`}
          series={[
            series('Input', [1200, 1800, 1500, 2400, 2100, 900, 1100]),
            series('Output', [600, 900, null, 1200, 1000, 400, 500]),
            series('Tool definitions', [200, 250, 240, 300, 280, 120, 140]),
          ]}
        />
        <DonutChart
          title="Runs by model"
          centerLabel="Runs"
          data={[
            { label: 'Claude Sonnet', value: 640, display: '640 runs' },
            { label: 'Claude Haiku', value: 380, display: '380 runs' },
            { label: 'Nova Pro', value: 164, display: '164 runs' },
            { label: 'Llama 3', value: 100, display: '100 runs' },
          ]}
        />
        <GroupedBarChart
          title="Run outcomes per day"
          groups={days.map((label, i) => ({
            label,
            bars: [
              { name: 'Passed', value: 30 + ((i * 11) % 40) },
              { name: 'Failed', value: 2 + ((i * 5) % 9) },
              { name: 'Cancelled', value: 1 + (i % 4) },
            ],
          }))}
        />
        <ComboChart
          title="Runs and success rate"
          bars={series('Runs', [40, 63, 86, 49, 72, 95, 58])}
          line={series('Success rate', [92, 95, 97, 93, 96, 99, 94])}
          formatLine={(n) => `${n}%`}
        />
      </div>
    </UpmoProvider>
  );
}

const stats: NonNullable<Window['__chartStats']> = {
  start: performance.now(),
  firstReady: null,
  allReady: null,
  firstPaint: null,
  heightsBefore: [],
};
window.__chartStats = stats;

// Watch for the charts to finish drawing.
const observer = new MutationObserver(() => {
  const ready = document.querySelectorAll('[data-chart-ready="true"]').length;
  if (ready >= 1 && stats.firstReady === null) {
    stats.firstReady = performance.now() - stats.start;
    // The frame after the first chart is drawn is when it is on screen.
    requestAnimationFrame(() => requestAnimationFrame(() => (stats.firstPaint = performance.now() - stats.start)));
  }
  if (ready >= 4 && stats.allReady === null) {
    stats.allReady = performance.now() - stats.start;
    observer.disconnect();
  }
});
observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-chart-ready'] });

const root = createRoot(document.getElementById('root')!);
flushSync(() => root.render(<Page />));
// The plots as first committed, with the placeholder in them.
stats.heightsBefore = [...document.querySelectorAll('.upmo-chart__plot')].map((el) => el.getBoundingClientRect().height);
