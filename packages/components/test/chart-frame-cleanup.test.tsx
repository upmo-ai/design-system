import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LineChart } from '../src/index.ts';
import { charts, resetCharts } from './fake-echarts.ts';
import { renderThemed } from './render.tsx';

vi.mock('../src/charts/echartsSetup.ts', () => import('./fake-echarts.ts'));

// Every `setX(false)` made after a chart was disposed. The frame disposes its chart in the
// effect cleanup, so a state update made there lands in this list.
const afterDispose = vi.hoisted(() => ({ calls: 0, isDisposed: () => false as boolean }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const fake = await import('./fake-echarts.ts');
  afterDispose.isDisposed = () => fake.charts.some((c) => c.disposed);
  const useState = (initial: unknown) => {
    const [value, set] = actual.useState(initial);
    const wrapped = actual.useCallback(
      (next: unknown) => {
        if (next === false && afterDispose.isDisposed()) afterDispose.calls += 1;
        (set as (v: unknown) => void)(next);
      },
      [set],
    );
    return [value, wrapped] as const;
  };
  return { ...actual, default: { ...actual, useState }, useState };
});

const series = [{ name: 'Input', points: [10, 20, 30].map((value, i) => ({ label: `D${i}`, value })) }];

afterEach(() => {
  resetCharts();
  afterDispose.calls = 0;
  vi.unstubAllGlobals();
});

describe('EChartFrame cleanup', () => {
  it('does not set state while it disposes its chart on unmount', async () => {
    const { container, unmount } = renderThemed(<LineChart title="A" series={series} />);
    await waitFor(() => expect(container.querySelectorAll('[data-chart-ready="true"]')).toHaveLength(1));
    expect(afterDispose.calls).toBe(0);
    act(() => unmount());
    expect(charts.every((c) => c.disposed)).toBe(true);
    expect(afterDispose.calls).toBe(0);
  });

  it('does not set state while it re-creates its chart for a host that got a size', async () => {
    let notify: () => void = () => {};
    class FakeObserver {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    const { container, unmount } = renderThemed(<LineChart title="A" series={series} width={480} height={200} />);
    await waitFor(() => expect(container.querySelectorAll('[data-chart-ready="true"]')).toHaveLength(1));

    const width = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
    const height = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
    Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => 300 });
    Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => 200 });
    try {
      act(() => notify());
      await waitFor(() => expect(charts.filter((c) => c.disposed)).toHaveLength(1));
      await waitFor(() => expect(container.querySelectorAll('[data-chart-ready="true"]')).toHaveLength(1));
      expect(afterDispose.calls).toBe(0);
    } finally {
      if (width) Object.defineProperty(Element.prototype, 'clientWidth', width);
      if (height) Object.defineProperty(Element.prototype, 'clientHeight', height);
      unmount();
    }
  });
});
