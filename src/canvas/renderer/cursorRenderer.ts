import { userStore } from '../store/index.ts';
import type { Cursor } from '../types/index.ts';

export const drawCursor = (ctx: CanvasRenderingContext2D, cameraScale: number, cursor: Cursor) => {
  const color = userStore.state.color;

  const cursorImageSrc = () => {
    if (color === '1') return '/cursor-pink.png';
    if (color === '2') return '/cursor-orange.png';
    if (color === '3') return '/cursor-green.png';
    return '/cursor-pink.png';
  };
  const cursorImage = new Image();
  cursorImage.src = cursorImageSrc();

  ctx.drawImage(cursorImage, cursor.x, cursor.y, 32 / cameraScale, 32 / cameraScale);
};
