import { CHART_COLORS, CHART_SIZES } from '../constants/constants.ts';
import { axisStore, dataSettingsStore } from '../store/index.ts';
import type { ChartData } from '../types/types.ts';
import { getBarHeight, getBarTopY, getBarX, isExcessive } from '../utils/index.ts';

import { drawBrokenBar } from './drawBrokenBar.ts';

type DrawChartProps = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  data: ChartData[];
  max: number;
};

const Y_TICK_COUNT = 5; // y axis 눈금 개수
const MIN_BAR_SPACING = 8; // 막대 최소 간격

// y축 숫자 포맷
const formatYTick = (v: number): string => {
  if (!Number.isFinite(v)) return '0';
  return String(Math.round(v));
};

export const drawChart = ({ ctx, width, height, data, max }: DrawChartProps) => {
  if (!width || !height || !data.length) return;

  const dpr = window.devicePixelRatio || 1;

  const canvas = ctx.canvas;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const { state: axis } = axisStore;
  const { state: dataOptions } = dataSettingsStore;

  const xAxisTitle = axis.xAxisName;
  const yAxisTitle = axis.yAxisName;
  const showYAxis = axis.showYAxisName;
  const showXTitle = xAxisTitle.length > 0;
  const showYTitle = yAxisTitle.length > 0;

  const showDataValues = dataOptions?.showDataValues;
  const showPercentage = dataOptions?.showPercentage;
  const showSum = dataOptions?.showSum;
  const totalValue = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  // 레이아웃 계산
  const extraBottom = showXTitle ? CHART_SIZES.AXIS_X_TITLE_EXTRA_BOTTOM : 0;
  const tickBand = showYAxis ? CHART_SIZES.AXIS_Y_TICK_GUTTER : 0;
  const titleBand = showYAxis && showYTitle ? CHART_SIZES.AXIS_Y_TITLE_BAND : 0;

  const paddingLeft = titleBand + tickBand;

  const chartHeight = height - CHART_SIZES.PADDING_TOP - CHART_SIZES.PADDING_BOTTOM - extraBottom;

  const plotWidth = width - paddingLeft;
  const spacing = Math.max(MIN_BAR_SPACING, (plotWidth - data.length * CHART_SIZES.BAR_WIDTH) / (data.length + 1));

  const yForValue = (v: number): number => {
    if (chartHeight <= 0) return CHART_SIZES.PADDING_TOP;
    if (max <= 0) return CHART_SIZES.PADDING_TOP + chartHeight;
    const clamped = Math.min(Math.max(v, 0), max);
    return CHART_SIZES.PADDING_TOP + chartHeight - (clamped / max) * chartHeight;
  };

  if (showYTitle) {
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = '14px Noto-Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(titleBand / 2, CHART_SIZES.PADDING_TOP + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisTitle, 0, 0);
    ctx.restore();
  }

  if (showYAxis) {
    const tickValues = max <= 0 ? [0] : Array.from({ length: Y_TICK_COUNT }, (_, i) => (max * i) / (Y_TICK_COUNT - 1));

    ctx.save();
    ctx.strokeStyle = CHART_COLORS.AXIS_GRID;
    ctx.lineWidth = 1;
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const tickLabelX = paddingLeft - 8;

    for (const t of tickValues) {
      const y = yForValue(t);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(formatYTick(t), tickLabelX, y);
    }
    ctx.restore();
  }

  data.forEach((item, index) => {
    const x = getBarX(index, spacing, paddingLeft);
    const excessive = isExcessive(item.value, max);

    ctx.beginPath();

    let barTopY: number;

    if (excessive) {
      barTopY = CHART_SIZES.PADDING_TOP;
      drawBrokenBar(ctx, x, chartHeight);
    } else {
      const barHeight = getBarHeight(item.value, max, chartHeight);
      barTopY = getBarTopY(item.value, max, chartHeight);
      ctx.roundRect(x, barTopY, CHART_SIZES.BAR_WIDTH, barHeight, CHART_SIZES.RADIUS);
    }

    const alpha = Math.min(100, Math.max(0, item.opacity ?? 100)) / 100;
    const fillColor = item.isActive === true ? CHART_COLORS.ACTIVE_FILL : CHART_COLORS.INACTIVE_FILL;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillColor;

    ctx.fill();
    ctx.globalAlpha = 1;

    if (showDataValues || showPercentage || item.isActive === true) {
      ctx.fillStyle = CHART_COLORS.ACTIVE_TEXT;
      ctx.font = 'bold 14px Noto-Sans';
      ctx.textAlign = 'center';

      const displayTopY = excessive ? CHART_SIZES.PADDING_TOP : barTopY;
      const valueLabel = Math.round(item.value).toString();
      const percentageLabel =
        totalValue > 0 ? `${((Math.max(0, item.value) / totalValue) * 100).toFixed(1).replace(/\.0$/, '')}%` : '0%';
      const barLabel =
        showDataValues && showPercentage
          ? `${valueLabel} (${percentageLabel})`
          : showDataValues
            ? valueLabel
            : percentageLabel;
      ctx.fillText(barLabel, x + CHART_SIZES.BAR_WIDTH / 2, displayTopY - 10);
    }

    ctx.closePath();

    ctx.fillStyle = item.isActive === true ? CHART_COLORS.ACTIVE_TEXT : CHART_COLORS.INACTIVE_TEXT;
    ctx.font = item.isActive === true ? 'bold 14px Noto-Sans' : '14px Noto-Sans';
    ctx.textAlign = 'center';
    const categoryBaselineY = height - 15 - (showXTitle ? 20 : 0);
    ctx.fillText(item.label, x + CHART_SIZES.BAR_WIDTH / 2, categoryBaselineY);
  });

  if (showXTitle) {
    const scrollContainer = canvas.parentElement?.closest('[data-chart-scroll-container="true"]') as HTMLElement | null;
    const viewportCenterX = scrollContainer
      ? scrollContainer.scrollLeft + scrollContainer.clientWidth / 2
      : paddingLeft + plotWidth / 2;
    const xTitleX = Math.max(paddingLeft, Math.min(width, viewportCenterX));
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = '14px Noto-Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(xAxisTitle, xTitleX, height - 6);
    ctx.restore();
  }

  if (showSum) {
    const scrollContainer = canvas.parentElement?.closest('[data-chart-scroll-container="true"]') as HTMLElement | null;
    const viewportRightX = scrollContainer ? scrollContainer.scrollLeft + scrollContainer.clientWidth - 8 : width - 8;
    const sumX = Math.max(paddingLeft + 40, Math.min(width - 8, viewportRightX));
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = 'bold 13px Noto-Sans';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Sum: ${Math.round(totalValue)}`, sumX, 8);
    ctx.restore();
  }

  return {
    chartHeight,
    spacing,
    originX: paddingLeft,
  };
};
