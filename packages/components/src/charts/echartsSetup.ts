/**
 * The only module that statically imports ECharts. Every chart reaches it
 * through a dynamic import (see EChartFrame), so the library lands in a lazy
 * chunk and never runs at import time, in a server render or in a test that
 * does not draw. Only the pieces the four charts use are registered, which is
 * what keeps that chunk small: lines, bars and pies, a cartesian grid, the
 * tooltip with its axis pointer, aria decals, and the SVG renderer.
 *
 * SVG, not canvas: text stays crisp at any pixel ratio and zoom in both themes,
 * the drawing is real DOM that a browser test can query, and it prints sharp.
 * These charts plot tens of points, well inside what SVG draws quickly.
 */
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { init, use, type ECharts, type EChartsCoreOption } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

export type { ECharts, EChartsCoreOption };

let registered = false;

/** Registers the ECharts modules once, then returns the init function. */
export function loadECharts(): { init: typeof init } {
  if (!registered) {
    use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, AriaComponent, SVGRenderer]);
    registered = true;
  }
  return { init };
}
