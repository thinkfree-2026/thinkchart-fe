import { CHART_SIZES } from '../constants/constants.ts';
import { getBarTopY, getBarX, isExcessive } from '../utils/index.ts';

type HitTestParams = {
  x: number;
  y: number;
  index: number;
  item: { value: number };
  spacing: number;
  chartHeight: number;
  max: number;
  originX?: number;
};

type HitTestResult = {
  hit: boolean;
  isTop: boolean;
  barX: number;
  barTopY: number;
};

export const hitTestBar = ({
  x,
  y,
  index,
  item,
  spacing,
  chartHeight,
  max,
  originX = 0,
}: HitTestParams): HitTestResult => {
  const barX = getBarX(index, spacing, originX);
  const excessive = isExcessive(item.value, max);

  let barTopY: number;
  let isTop: boolean;
  let isInside: boolean;

  if (excessive) {
    barTopY = CHART_SIZES.PADDING_TOP;

    const topPartHeight = chartHeight * 0.25;

    isTop = Math.abs(y - barTopY) < CHART_SIZES.HIT_TOLERANCE;

    const topEnd = barTopY + topPartHeight;
    const bottomStart = topEnd + CHART_SIZES.BROKEN_GAP;

    isInside = (y >= barTopY && y <= topEnd) || (y >= bottomStart && y <= CHART_SIZES.PADDING_TOP + chartHeight);
  } else {
    barTopY = getBarTopY(item.value, max, chartHeight);

    isTop = Math.abs(y - barTopY) < CHART_SIZES.HIT_TOLERANCE;

    isInside = y >= barTopY && y <= CHART_SIZES.PADDING_TOP + chartHeight;
  }

  const isX = x >= barX && x <= barX + CHART_SIZES.BAR_WIDTH;

  return {
    hit: isX && (isInside || isTop),
    isTop,
    barX,
    barTopY,
  };
};
