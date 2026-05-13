import { CHART_SIZES } from '../constants/constants.ts';

export const getBarX = (index: number, spacing: number, originX = 0): number => {
  return originX + spacing + index * (CHART_SIZES.BAR_WIDTH + spacing);
};

export const getBarHeight = (value: number, max: number, chartHeight: number): number => {
  return (value / max) * chartHeight;
};

export const getBarTopY = (value: number, max: number, chartHeight: number): number => {
  const barHeight = getBarHeight(value, max, chartHeight);
  return CHART_SIZES.PADDING_TOP + (chartHeight - barHeight);
};

export const isExcessive = (value: number, max: number): boolean => {
  return value > max;
};
