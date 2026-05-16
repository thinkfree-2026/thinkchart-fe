import { CIRCLE_HIGHLIGHT_COLOR } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

export const drawHighlight = (
  ctx: CanvasRenderingContext2D,
  cameraScale: number,
  circle: Circle,
  showSquare: boolean,
  squareThickness: number,
  showCircleBorder: boolean,
  circleThickness: number
) => {
  const diameter = circle.radius * 2;

  // 선택 영역을 나타내는 사각형 박스 테두리 생성
  if (showSquare) {
    // 카메라 배율로 두께를 나누어 모니터 화면에서 항상 일정한 픽셀 두께 유지
    ctx.lineWidth = squareThickness / cameraScale;
    ctx.strokeStyle = CIRCLE_HIGHLIGHT_COLOR;
    ctx.strokeRect(circle.x - circle.radius, circle.y - circle.radius, diameter, diameter);
  }

  // 호버 및 선택 상태를 강조하는 원형 테두리 생성
  if (showCircleBorder) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.lineWidth = circleThickness / cameraScale;
    ctx.strokeStyle = CIRCLE_HIGHLIGHT_COLOR;
    ctx.stroke();
  }
};
