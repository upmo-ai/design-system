/**
 * A tiny stand-in for charts/echartsSetup.ts, used through vi.mock by the chart
 * tests. jsdom has no layout and no SVG measuring, so ECharts cannot draw there.
 * This fake records what the charts ask of it: the options passed to setOption,
 * the dispatchAction calls, the sizes, and when the instance is disposed. The
 * tests assert on those, and call the option's formatters directly.
 */

// An ECharts option is a deep, loosely typed tree; the tests read it as such.
export type Opt = any;

export interface FakeChart {
  host: HTMLElement;
  /** The init options: renderer and, without layout, width and height. */
  initOptions: Opt;
  options: Opt[];
  /** Whether each setOption replaced the previous option (notMerge). */
  replaced: boolean[];
  actions: Opt[];
  resizes: (Opt | undefined)[];
  disposed: boolean;
}

/** Every instance created since the last reset, in creation order. */
export const charts: FakeChart[] = [];

export function resetCharts() {
  charts.length = 0;
}

export const live = () => charts.filter((c) => !c.disposed);

/** The newest option of the newest live chart. */
export function lastOption(index = live().length - 1): Opt {
  const chart = live()[index];
  if (!chart) throw new Error('no live chart');
  return chart.options[chart.options.length - 1];
}

export function actionsOf(type: string, index = live().length - 1): Opt[] {
  return (live()[index]?.actions ?? []).filter((a) => a.type === type);
}

function init(host: HTMLElement, _theme?: unknown, initOptions: Opt = {}) {
  const chart: FakeChart = {
    host,
    initOptions,
    options: [],
    replaced: [],
    actions: [],
    resizes: [],
    disposed: false,
  };
  charts.push(chart);
  return {
    setOption(option: Opt, notMerge?: boolean) {
      chart.options.push(option);
      chart.replaced.push(notMerge === true);
    },
    dispatchAction(action: Opt) {
      chart.actions.push(action);
    },
    resize(size?: Opt) {
      chart.resizes.push(size);
    },
    dispose() {
      chart.disposed = true;
    },
    getOption() {
      return chart.options[chart.options.length - 1];
    },
  };
}

// The same shape as the real module: a loader that returns init.
export function loadECharts() {
  return { init };
}
