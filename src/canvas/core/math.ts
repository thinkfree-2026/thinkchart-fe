import type { Camera } from '../types/index.ts';

// 화면 픽셀 좌표를 가상 캔버스의 World 좌표로 변환
export const screenToWorld = (clientX: number, clientY: number, camera: Camera): { x: number; y: number } => {
  return {
    x: (clientX - camera.x) / camera.scale,
    y: (clientY - camera.y) / camera.scale,
  };
};
