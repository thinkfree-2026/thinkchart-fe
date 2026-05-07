import { CIRCLE_BORDER_COLOR } from '../constants/index.ts';
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
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

  ctx.fillStyle = circle.color;
  ctx.fill();

  // 마우스 상호작용이 없고 가이드 원이 아닌 기본 상태의 원에만 테두리 렌더링
  if (!isHovered && !isSelected && !isGuide) {
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = CIRCLE_BORDER_COLOR;
    ctx.stroke();
  }
};
