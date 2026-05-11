import { createRef } from '../utils/index.ts';
import { CHART_SIZES } from './constants/constants.ts';
import type { BarChartProps } from './types/index.ts';

export const BarChart = ({ data }: BarChartProps) => {
  const canvasWrapperRef = createRef<HTMLElement>(null);

  const MIN_SPACING = 12;

  const barCount = Math.max(1, data.length);

  const minCanvasWidth =
    barCount * CHART_SIZES.BAR_WIDTH +
    (barCount + 1) * MIN_SPACING +
    CHART_SIZES.AXIS_Y_TICK_GUTTER +
    CHART_SIZES.AXIS_Y_TITLE_BAND;

  return (
    <div ref={canvasWrapperRef} class="relative h-full w-full overflow-x-auto overflow-y-hidden">
      <div class="h-full min-w-full" style={{ minWidth: `${minCanvasWidth}px` }}>
        <canvas class="block h-full w-full touch-none" />
      </div>
    </div>
  );
};
