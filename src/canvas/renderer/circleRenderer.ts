import { CIRCLE_BORDER_COLOR, MAX_VALUE } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

// 개별 원과 기본 테두리를 캔버스에 그리는 전담 함수
// 가이드 원일 경우 테두리를 그리지 않도록 분기 처리
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  isHovered: boolean,
  isSelected: boolean,
  isGuide: boolean = false
) => {
  // 원 생성
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = circle.color;
  ctx.fill();

  // 원 내부 텍스트
  const fontSize = Math.max(14, circle.value / 2);
  ctx.font = `bold ${fontSize}px "Noto Sans", sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center'; // Horizontal center
  ctx.textBaseline = 'middle';
  ctx.fillText(String(circle.value), circle.x, circle.y);

  // 원 실선 테두리
  if (!isHovered && !isSelected && !isGuide) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = CIRCLE_BORDER_COLOR;
    ctx.stroke();
  }

  if (circle.value >= MAX_VALUE) {
    // 원 점선 테두리
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 5]);
    ctx.lineCap = 'butt';
    ctx.stroke();

    ctx.setLineDash([]);
  }
};
