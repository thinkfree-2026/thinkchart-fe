import type { Circle } from '../types/index.ts';

export const drawConnection = (ctx: CanvasRenderingContext2D, connectedCircles: Map<string, Circle[]>) => {
  ctx.save();
  ctx.lineWidth = 25;
  ctx.strokeStyle = 'rgba(255, 162, 178, 0.3)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const tension = 0.2;

  connectedCircles.forEach(connectedCircle => {
    const length = connectedCircle.length;
    if (length < 2) return;

    ctx.beginPath();
    ctx.moveTo(connectedCircle[0].x, connectedCircle[0].y);

    for (let i = 0; i < length - 1; i++) {
      const p0 = i === 0 ? connectedCircle[0] : connectedCircle[i - 1];
      const p1 = connectedCircle[i];
      const p2 = connectedCircle[i + 1];
      const p3 = i === length - 2 ? connectedCircle[length - 1] : connectedCircle[i + 2];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;

      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();
  });

  ctx.restore();
};
