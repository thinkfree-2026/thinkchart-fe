import type { Camera } from '../types/index.ts';

// WebGL에서 사용할 3x3 행렬 유틸리티 (Float32Array)
export const Matrix3 = {
  // 단위 행렬
  create(): Float32Array {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  },

  // 픽셀 좌표 -> NDC 좌표 (화면의 width, height를 WebGL이 이해하는 -1 ~ 1 범위로 압축)
  projection(width: number, height: number): Float32Array {
    return new Float32Array([2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1]);
  },

  // 이동 및 줌을 적용하는 Camera 행렬
  translateAndScale(out: Float32Array, tx: number, ty: number, scale: number): void {
    // 이동
    out[6] = tx;
    out[7] = ty;

    // 확대/축소
    out[0] = scale;
    out[4] = scale;
  },
};

// 화면 픽셀 좌표를 가상 캔버스의 World 좌표로 변환
export function screenToWorld(clientX: number, clientY: number, camera: Camera): { x: number; y: number } {
  return {
    x: (clientX - camera.x) / camera.scale,
    y: (clientY - camera.y) / camera.scale,
  };
}
