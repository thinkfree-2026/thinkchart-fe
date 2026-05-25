import { CHART_COLORS, CHART_SIZES } from '../constants/constants.ts';
import { chartStore, dataSettingsStore } from '../store/index.ts';
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

const BAR_VALUE_GAP = 10;
const LABEL_BOTTOM = 15;
const X_TITLE_SPACE = 20;
const X_TITLE_BOTTOM = 6;
const SUM_RIGHT_GAP = 8;
const SUM_MIN_LEFT = 40;

const Y_AXIS_COUNT = 5; // y axis 눈금 개수
const MIN_BAR_SPACING = 8; // 막대 최소 간격

export const drawChart = ({ ctx, width, height, data, max }: DrawChartProps) => {
  if (!width || !height || !data.length) return;

  const dpr = window.devicePixelRatio || 1;

  const canvas = ctx.canvas;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // redraw마다 scale이 누적되지 않도록 transform을 매번 초기화한다.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const { state: axis } = chartStore;
  const { state: dataOptions } = dataSettingsStore;

  const xAxisTitle = axis.xAxisName.trim();
  const yAxisTitle = axis.yAxisName.trim();
  const showXTitle = axis.showXAxisName && xAxisTitle.length > 0;
  const showYTitle = axis.showYAxisName && yAxisTitle.length > 0;
  const showYAxis = axis.showYAxisName;

  const showDataValues = dataOptions.showDataValues;
  const showPercentage = dataOptions.showPercentage;
  const showSum = dataOptions.showSum;
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // 레이아웃 계산
  const axisXTitleSpace = showXTitle ? CHART_SIZES.AXIS_X_TITLE_SPACE : 0;
  const axisYAxisSpace = CHART_SIZES.AXIS_Y_AXIS_SPACE;
  const axisYTitleSpace = showYTitle ? CHART_SIZES.AXIS_Y_TITLE_SPACE : 0;

  const paddingLeft = axisYAxisSpace + axisYTitleSpace;

  const chartHeight = height - CHART_SIZES.PADDING_TOP - CHART_SIZES.PADDING_BOTTOM - axisXTitleSpace;
  const chartWidth = width - paddingLeft;

  const gap = Math.max(MIN_BAR_SPACING, (chartWidth - data.length * CHART_SIZES.BAR_WIDTH) / (data.length + 1));

  // 데이터 값 -> 화면 y좌표
  // 캔버스 좌표는 일반 수학 좌표와 반대이기 때문에 연산해주는 함수
  // ex) 캔버스 아래로 갈수록 증가 / 막대는 위로 갈수록 증가
  const yForValue = (v: number): number => {
    if (chartHeight <= 0) return CHART_SIZES.PADDING_TOP;
    if (max <= 0) return CHART_SIZES.PADDING_TOP + chartHeight;
    const clamped = Math.min(Math.max(v, 0), max); // 범위 제한
    return CHART_SIZES.PADDING_TOP + chartHeight - (clamped / max) * chartHeight;
  };

  // y축 좌표 숫자 포맷
  const formatYCoord = (v: number): string => {
    if (!Number.isFinite(v)) return '0';
    return String(Math.round(v));
  };

  if (showYTitle) {
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = '14px Noto-Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(axisYTitleSpace / 2, CHART_SIZES.PADDING_TOP + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisTitle, 0, 0);
    ctx.restore();
  }

  if (showYAxis) {
    const coordYValues =
      max <= 0 ? [0] : Array.from({ length: Y_AXIS_COUNT }, (_, i) => (max * i) / (Y_AXIS_COUNT - 1));

    ctx.save();
    ctx.strokeStyle = CHART_COLORS.AXIS_GRID;
    ctx.lineWidth = 1;
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const labelX = paddingLeft - MIN_BAR_SPACING;

    for (const t of coordYValues) {
      const y = yForValue(t);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(formatYCoord(t), labelX, y);
    }
    ctx.restore();
  }

  data.forEach((item, index) => {
    const x = getBarX(index, gap, paddingLeft);
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

    const alpha = item.opacity;
    const fillColor = item.color;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillColor;

    ctx.fill();
    ctx.globalAlpha = 1;

    if (showDataValues || showPercentage || item.isActive === true) {
      if (item.isDirty === true) {
        ctx.fillStyle = CHART_COLORS.UNSAVED_TEXT;
      } else if (item.isActive === true) {
        ctx.fillStyle = CHART_COLORS.ACTIVE_TEXT;
      } else {
        ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
      }

      ctx.font = 'bold 14px Noto-Sans';
      ctx.textAlign = 'center';

      const displayTopY = excessive ? CHART_SIZES.PADDING_TOP : barTopY;
      const valueLabel = Math.round(item.value).toString();

      const percentageLabel =
        totalValue > 0 ? `${((item.value / totalValue) * 100).toFixed(1).replace(/\.0$/, '')}%` : '0%';
      const barLabel =
        showDataValues && showPercentage
          ? `${valueLabel}${axis.unit} (${percentageLabel})`
          : showPercentage
            ? percentageLabel
            : `${valueLabel}${axis.unit}`;
      ctx.fillText(barLabel, x + CHART_SIZES.BAR_WIDTH / 2, displayTopY - BAR_VALUE_GAP);
    }

    ctx.closePath();

    ctx.fillStyle = item.isActive === true ? CHART_COLORS.ACTIVE_TEXT : CHART_COLORS.INACTIVE_TEXT;
    ctx.font = item.isActive === true ? 'bold 14px Noto-Sans' : '14px Noto-Sans';
    ctx.textAlign = 'center';
    const categoryBaselineY = height - LABEL_BOTTOM - (showXTitle ? X_TITLE_SPACE : 0);
    ctx.fillText(item.name, x + CHART_SIZES.BAR_WIDTH / 2, categoryBaselineY);
  });

  if (showXTitle) {
    const scrollContainer = canvas.parentElement?.closest('[data-chart-scroll-container="true"]') as HTMLElement | null;
    const viewportCenterX = scrollContainer
      ? scrollContainer.scrollLeft + scrollContainer.clientWidth / 2
      : paddingLeft + chartWidth / 2;
    const xTitleX = Math.max(paddingLeft, Math.min(width, viewportCenterX));
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = '14px Noto-Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(xAxisTitle, xTitleX, height - X_TITLE_BOTTOM);
    ctx.restore();
  }

  if (showSum) {
    const scrollContainer = canvas.parentElement?.closest('[data-chart-scroll-container="true"]') as HTMLElement | null;
    const viewportRightX = scrollContainer
      ? scrollContainer.scrollLeft + scrollContainer.clientWidth - SUM_RIGHT_GAP
      : width - SUM_RIGHT_GAP;
    const sumX = Math.max(paddingLeft + SUM_MIN_LEFT, Math.min(width - SUM_RIGHT_GAP, viewportRightX));
    ctx.save();
    ctx.fillStyle = CHART_COLORS.INACTIVE_TEXT;
    ctx.font = 'bold 13px Noto-Sans';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Sum: ${Math.round(totalValue)}`, sumX, SUM_RIGHT_GAP);
    ctx.restore();
  }

  return {
    chartHeight,
    gap,
    originX: paddingLeft,
  };
};
