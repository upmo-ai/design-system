// @vitest-environment node
//
// The chart modules in plain node: no document, no window. A server render (or
// any code that imports the charts before a DOM exists) must not throw.
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compactNumber } from '../src/charts/chartFormat.ts';
import { prefersReducedMotion } from '../src/charts/chartTheme.ts';
import { ComboChart, DonutChart, GroupedBarChart, LineChart, UpmoProvider } from '../src/index.ts';

const points = (values: number[]) => values.map((value, i) => ({ label: `D${i}`, value }));

describe('charts without a DOM', () => {
  it('runs in an environment with no document or window', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
  });

  it('prefersReducedMotion answers false instead of throwing', () => {
    expect(() => prefersReducedMotion()).not.toThrow();
    expect(prefersReducedMotion()).toBe(false);
  });

  it('formats numbers', () => {
    expect(compactNumber(2_300_000)).toBe('2.3M');
  });

  it('renders all four charts to a string on the server', () => {
    const render = (node: ReactNode) => renderToString(<UpmoProvider>{node}</UpmoProvider>);
    const html = [
      render(<LineChart title="Line" series={[{ name: 'A', points: points([1, 2, 3]) }]} />),
      render(<DonutChart title="Donut" data={[{ label: 'A', value: 2 }, { label: 'B', value: 3 }]} />),
      render(
        <GroupedBarChart title="Bars" groups={[{ label: 'Mon', bars: [{ name: 'A', value: 1 }, { name: 'B', value: 2 }] }]} />,
      ),
      render(
        <ComboChart title="Combo" bars={{ name: 'Runs', points: points([1, 2]) }} line={{ name: 'Rate', points: points([5, 6]) }} />,
      ),
    ];
    for (const out of html) expect(out).toContain('upmo-chart');
  });
});
