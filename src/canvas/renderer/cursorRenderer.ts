import type { Cursor } from '../types/index.ts';

export const drawCursor = (ctx: CanvasRenderingContext2D, cursor: Cursor) => {
  const cursorImage = new Image();
  cursorImage.src = '/cursor-pink.png';

  ctx.drawImage(cursorImage, cursor.x, cursor.y);
};
