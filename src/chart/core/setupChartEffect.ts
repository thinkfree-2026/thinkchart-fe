import type { BarChartProps } from '../types/index.ts';

import { createChart } from './createChart.ts';
import { createSubscriptions } from './createSubscriptions.ts';

type SetupChartEffectProps = {
  data: BarChartProps['data'];
  onBarClick: BarChartProps['onBarClick'];
  onChartReady?: BarChartProps['onChartReady'];
};

export const setupChartEffect = (
  canvasWrapperRef: HTMLElement | null,
  canvasElement: HTMLCanvasElement,
  { data, onBarClick, onChartReady }: SetupChartEffectProps
) => {
  const { subscribeAxisRedraw, subscribeDataRedraw, subscribeViewportRedraw } = createSubscriptions({
    scrollContainer: canvasWrapperRef,
  });

  const { destroy, redraw } = createChart(canvasElement, data, onBarClick, {
    subscribeAxisRedraw,
    subscribeDataRedraw,
    subscribeViewportRedraw,
  });

  onChartReady?.({ redraw });

  return () => destroy();
};
