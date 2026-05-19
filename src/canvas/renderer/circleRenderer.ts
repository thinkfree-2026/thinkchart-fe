import { chartListState } from '../../store/index.ts';
import { CIRCLE_BORDER_COLOR, MAX_VALUE } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Circle | Omit<Circle, 'userId' | 'id' | 'opacity'>,
  isHovered: boolean,
  isSelected: boolean,
  isGuide: boolean = false
) => {
  const hasChartId = 'chartId' in circle && circle.chartId != null;
  const circleColor = () => {
    if (isGuide) return circle.color;
    if (hasChartId && circle.chartId === chartListState.hoveredChartId) return '#FFF3F5';
    if (hasChartId) return 'rgba(253, 230, 234, 0.5)';
    return 'rgba(199, 210, 254, 0.5)';
  };

  // 원 바깥쪽 그라데이션
  if (hasChartId && circle.chartId === chartListState.hoveredChartId) {
    const glowSize = 30;
    const glowRadius = circle.radius + glowSize;

    const gradient = ctx.createRadialGradient(circle.x, circle.y, circle.radius - 1, circle.x, circle.y, glowRadius);

    gradient.addColorStop(0, 'rgba(255, 243, 245, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 139, 176, 0)');

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, glowRadius, 0, Math.PI * 2);
    ctx.arc(circle.x, circle.y, circle.radius - 1, 0, Math.PI * 2, true);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // 원 생성
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = circleColor();
  ctx.fill();

  // 원 내부 텍스트
  const fontSize = Math.max(14, circle.value / 2);
  ctx.font = `bold ${fontSize}px "Noto Sans", sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(circle.value), circle.x, circle.y);

  // 원 실선 테두리
  if (!isHovered && !isSelected && !isGuide) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = hasChartId ? '#E18BB0' : CIRCLE_BORDER_COLOR;
    ctx.stroke();
  }

  if (circle.value >= MAX_VALUE) {
    // 원 점선 테두리
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = hasChartId ? '#E5BCC4' : 'rgba(129, 140, 248, 0.7)';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 5]);
    ctx.lineCap = 'butt';
    ctx.stroke();

    ctx.setLineDash([]);
  }
};
