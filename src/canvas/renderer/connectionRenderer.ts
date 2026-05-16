import type { Circle } from '../types/index.ts';

export const drawConnection = (
  ctx: CanvasRenderingContext2D,
  cameraScale: number,
  connectedCircles: Map<string, Circle[]>
) => {
  ctx.save();
  ctx.lineWidth = 5 / cameraScale;
  ctx.strokeStyle = '#E5BCC4';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  connectedCircles.forEach(connectedCircle => {
    if (connectedCircle.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(connectedCircle[0].x, connectedCircle[0].y);

    connectedCircle.forEach(circle => ctx.lineTo(circle.x, circle.y));

    ctx.stroke();
  });

  ctx.restore();
};
