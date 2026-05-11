import { CHART_SIZES } from '../constants/constants.ts';

const drawWave = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  amplitude: number,
  segments: number,
  direction: 1 | -1 // 위(+), 아래(-)
) => {
  const segmentWidth = width / segments;

  ctx.lineTo(x, y);

  for (let i = 0; i < segments; i++) {
    const startX = x + i * segmentWidth;
    const midX = startX + segmentWidth / 2;
    const endX = startX + segmentWidth;

    const controlY = y + amplitude * (i % 2 === 0 ? direction : -direction);

    ctx.quadraticCurveTo(midX, controlY, endX, y);
  }
};

export const drawBrokenBar = (ctx: CanvasRenderingContext2D, x: number, chartHeight: number) => {
  const topPartHeight = chartHeight * 0.25;

  const topStartY = CHART_SIZES.PADDING_TOP;
  const topEndY = topStartY + topPartHeight;

  const bottomStartY = topEndY + CHART_SIZES.BROKEN_GAP;
  const bottomEndY = CHART_SIZES.PADDING_TOP + chartHeight;

  const width = CHART_SIZES.BAR_WIDTH;
  const r = CHART_SIZES.RADIUS;

  const amplitude = 10;
  const segments = 2;

  // --- 상단 ---
  ctx.moveTo(x + r, topStartY);

  ctx.lineTo(x + width - r, topStartY);
  ctx.arcTo(x + width, topStartY, x + width, topStartY + r, r);

  ctx.lineTo(x + width, topEndY);

  // 오른쪽 → 왼쪽 웨이브
  drawWave(ctx, x + width, topEndY, -width, amplitude, segments, 1);

  ctx.lineTo(x, topStartY + r);
  ctx.arcTo(x, topStartY, x + r, topStartY, r);

  // --- 하단 ---
  ctx.moveTo(x, bottomStartY);

  // 왼쪽 → 오른쪽 웨이브 (같은 함수, 방향만 반대)
  drawWave(ctx, x, bottomStartY, width, amplitude, segments, -1);

  ctx.lineTo(x + width, bottomEndY - r);
  ctx.arcTo(x + width, bottomEndY, x + width - r, bottomEndY, r);

  ctx.lineTo(x + r, bottomEndY);
  ctx.arcTo(x, bottomEndY, x, bottomEndY - r, r);
};
