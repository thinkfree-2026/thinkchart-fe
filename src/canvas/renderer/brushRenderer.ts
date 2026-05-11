export const drawBrush = (
  ctx: CanvasRenderingContext2D,
  cameraScale: number,
  points: Array<{ x: number; y: number }>
) => {
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length - 1; index++) {
    const midPointX = (points[index].x + points[index + 1].x) / 2;
    const midPointY = (points[index].y + points[index + 1].y) / 2;
    ctx.quadraticCurveTo(points[index].x, points[index].y, midPointX, midPointY);
  }

  // 마지막 궤적까지 이어지게 선 연결
  if (points.length > 1) {
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
  } else {
    // 점이 하나인 경우 제자리 원 렌더링
    ctx.lineTo(points[0].x, points[0].y);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 50 / cameraScale;
  ctx.strokeStyle = '#ff007a4d';
  ctx.stroke();
};
