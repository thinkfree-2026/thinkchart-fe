import { CIRCLE_HIGHLIGHT_COLOR } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

export const drawHighlight = (
  ctx: CanvasRenderingContext2D,
  cameraScale: number,
  circle: Circle,
  showSquare: boolean,
  squareThickness: number,
  showCircleBorder: boolean,
  circleThickness: number,
  isSingleSelected: boolean = false
) => {
  const diameter = circle.radius * 2;

  // 사각형 박스 테두리
  if (showSquare) {
    ctx.lineWidth = squareThickness / cameraScale;
    ctx.strokeStyle = CIRCLE_HIGHLIGHT_COLOR;
    ctx.strokeRect(circle.x - circle.radius, circle.y - circle.radius, diameter, diameter);

    // 꼭짓점 사각형 4개
    if (isSingleSelected) {
      const handleSize = 5 / cameraScale;
      const halfHandle = handleSize / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = 1 / cameraScale;

      const corners = [
        { x: circle.x - circle.radius, y: circle.y - circle.radius }, // nw
        { x: circle.x + circle.radius, y: circle.y - circle.radius }, // ne
        { x: circle.x - circle.radius, y: circle.y + circle.radius }, // sw
        { x: circle.x + circle.radius, y: circle.y + circle.radius }, // se
      ];

      corners.forEach(corner => {
        ctx.fillRect(corner.x - halfHandle, corner.y - halfHandle, handleSize, handleSize);
        ctx.strokeRect(corner.x - halfHandle, corner.y - halfHandle, handleSize, handleSize);
      });
    }
  }

  // 호버 및 선택 원형 테두리
  if (showCircleBorder) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.lineWidth = circleThickness / cameraScale;
    ctx.strokeStyle = CIRCLE_HIGHLIGHT_COLOR;
    ctx.stroke();
  }
};
