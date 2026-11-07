import clsx from 'clsx';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Action, ChartSize, NavPlan } from './chartOptions.ts';
import { observeChartTheme, readChartTheme, themeKey, type ChartTheme } from './chartTheme.ts';
import type { ECharts, EChartsCoreOption } from './echartsSetup.ts';

type Runtime = ReturnType<typeof import('./echartsSetup.ts').loadECharts>;

let loading: Promise<Runtime> | null = null;

/**
 * Loads ECharts on first use and shares the result. The dynamic import is what
 * puts the library in its own chunk; nothing here runs at import time, so a
 * server render and a test that never draws never touch it.
 */
function loadRuntime(): Promise<Runtime> {
  if (!loading) {
    loading = import('./echartsSetup.ts')
      .then((mod) => mod.loadECharts())
      .catch((error: unknown) => {
        loading = null; // let the next mount try again
        throw error;
      });
  }
  return loading;
}

export interface EChartFrameProps {
  /** Plot height in px. With `square` it is only the size used before the container is measured. */
  height: number;
  /** Width in px used only while the container has no measurable width (a server render, a hidden tab). */
  width: number;
  /** Keep the plot square, as wide as its container allows (the donut). */
  square?: boolean;
  /**
   * Builds the ECharts option from the live theme and the drawn size in px. Keep it
   * stable (useCallback) for unchanged inputs: a new function re-applies the option,
   * which closes the tooltip.
   */
  build: (theme: ChartTheme, size: ChartSize) => EChartsCoreOption;
  /**
   * Build again when the drawn size changes, for a chart whose axes depend on it (how many
   * ticks fit). The new option is merged into the drawing, so the tooltip and animation are
   * left alone. Off by default: the donut does not care.
   */
  responsive?: boolean;
  /** Receives the chart instance while one exists, for dispatchAction from legends. */
  chartRef?: MutableRefObject<ECharts | null>;
  /** The keyboard-focused position, or null. Its tooltip and highlight follow it. */
  active?: number | null;
  /** The actions that show a position (see chartOptions: axisNavPlan, sliceNavPlan). */
  navPlan?: (index: number) => NavPlan;
  className?: string;
}

/**
 * The shared frame of the ECharts-backed charts. It lazy loads ECharts, inits on
 * mount, follows its container with a ResizeObserver, rebuilds the option when
 * the theme changes, keeps the keyboard position's tooltip in step, and disposes
 * on unmount. Until the chunk arrives it holds the plot's height with a quiet
 * placeholder, so nothing shifts. The drawing is hidden from assistive
 * technology: each chart carries its data in a visually hidden table.
 */
export function EChartFrame({
  height,
  width,
  square = false,
  build,
  responsive = false,
  chartRef,
  active = null,
  navPlan,
  className,
}: EChartFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ECharts | null>(null);
  // The size the chart was last given while the container had none, else null.
  const fallbackSize = useRef<{ width: number; height: number } | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [theme, setTheme] = useState<ChartTheme | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [ready, setReady] = useState(false);
  // The drawn size, in px, that the option was last built for. A change after the first draw
  // bumps the counter, which rebuilds a responsive chart's option.
  const sizeRef = useRef<ChartSize>({ width, height });
  const [sizeEpoch, setSizeEpoch] = useState(0);

  // What the keyboard position currently shows, so the next change can undo it.
  const shown = useRef<{ tip: boolean; highlight: Action | null }>({ tip: false, highlight: null });
  const latest = useRef({ active, navPlan, build, theme, responsive });
  latest.current = { active, navPlan, build, theme, responsive };

  /** Notes the drawn size; a responsive chart builds its option again when it changed. */
  const noteSize = (next: ChartSize) => {
    const last = sizeRef.current;
    if (last.width === next.width && last.height === next.height) return;
    sizeRef.current = next;
    if (latest.current.responsive) setSizeEpoch((e) => e + 1);
  };

  useEffect(() => {
    let alive = true;
    loadRuntime()
      .then((loaded) => {
        if (alive) setRuntime(loaded);
      })
      .catch(() => {
        // The hidden data table still carries the data; the placeholder stays.
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let key = '';
    const update = () => {
      const next = readChartTheme(host);
      const nextKey = themeKey(next);
      if (nextKey === key) return;
      key = nextKey;
      setTheme(next);
    };
    update();
    return observeChartTheme(host, update);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!runtime || !host) return;
    // With no layout (a hidden tab, a server render, jsdom) draw at the fallback size and
    // start over once the container has one.
    const measured = host.clientWidth > 0 && host.clientHeight > 0;
    const chart = runtime.init(host, undefined, {
      renderer: 'svg',
      ...(measured ? {} : { width, height }),
    });
    instanceRef.current = chart;
    fallbackSize.current = measured ? null : { width, height };
    // The option below is built for this size; nothing to rebuild yet.
    sizeRef.current = measured ? { width: host.clientWidth, height: host.clientHeight } : { width, height };
    if (chartRef) chartRef.current = chart;
    shown.current = { tip: false, highlight: null };

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!measured && host.clientWidth > 0 && host.clientHeight > 0) {
          setEpoch((e) => e + 1);
          return;
        }
        // A hidden host (display: none, a closed tab) reports no size. Resizing to nothing
        // would blank the drawing; keep it as is, and the observer fires again with a real
        // size when the host is shown.
        if (host.clientWidth === 0 || host.clientHeight === 0) return;
        chart.resize();
        noteSize({ width: host.clientWidth, height: host.clientHeight });
      });
      observer.observe(host);
    }

    return () => {
      observer?.disconnect();
      chart.dispose();
      if (instanceRef.current === chart) instanceRef.current = null;
      if (chartRef && chartRef.current === chart) chartRef.current = null;
    };
    // The size props are read at init only; a later change is handled below.
  }, [runtime, epoch]);

  // With no layout the chart is drawn at the width and height props, so a change to
  // them resizes it. With layout the ResizeObserver above owns the size.
  useEffect(() => {
    const chart = instanceRef.current;
    const last = fallbackSize.current;
    if (!chart || !last || (last.width === width && last.height === height)) return;
    fallbackSize.current = { width, height };
    chart.resize({ width, height });
    noteSize({ width, height });
  }, [width, height]);

  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart || !theme) return;
    chart.setOption(build(theme, sizeRef.current), true);
    // A fresh option starts with nothing shown; bring the keyboard position back.
    shown.current = { tip: false, highlight: null };
    syncPosition(chart, shown.current, latest.current.active, latest.current.navPlan);
    setReady(true);
  }, [runtime, epoch, theme, build]);

  // A size change after the first draw: merge the rebuilt option (new tick count, same data)
  // into the drawing, so the tooltip and the series are not replayed.
  useEffect(() => {
    const chart = instanceRef.current;
    const { theme: current, build: rebuild, responsive: on } = latest.current;
    if (!chart || !current || !on || sizeEpoch === 0) return;
    chart.setOption(rebuild(current, sizeRef.current));
  }, [sizeEpoch]);

  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart || !ready) return;
    syncPosition(chart, shown.current, active, navPlan);
  }, [active, navPlan, ready]);

  return (
    <div
      className={clsx('upmo-chart__plot', square && 'upmo-chart__plot--square', className)}
      style={square ? undefined : { height }}
      aria-hidden="true"
      data-chart-ready={ready ? 'true' : 'false'}
    >
      <div ref={hostRef} className="upmo-chart__canvas" />
      {ready ? null : <div className="upmo-chart__loading" />}
    </div>
  );
}

/** Shows the tooltip and highlight of `active`, and undoes the previous position's. */
function syncPosition(
  chart: ECharts,
  state: { tip: boolean; highlight: Action | null },
  active: number | null,
  navPlan: ((index: number) => NavPlan) | undefined,
) {
  if (state.highlight) chart.dispatchAction({ ...state.highlight, type: 'downplay' });
  state.highlight = null;

  const plan = active !== null && navPlan ? navPlan(active) : null;
  if (!plan || !plan.tip) {
    // A position with nothing to anchor to (every series has a gap there) shows no tooltip,
    // and clears one that is still up, even one the pointer opened.
    if (state.tip || active !== null) chart.dispatchAction({ type: 'hideTip' });
    state.tip = false;
    return;
  }
  chart.dispatchAction(plan.tip);
  state.tip = true;
  if (plan.highlight) {
    chart.dispatchAction(plan.highlight);
    state.highlight = plan.highlight;
  }
}
