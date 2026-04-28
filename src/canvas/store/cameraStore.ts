import type { Camera } from '../types/index.ts';

const createCameraStore = () => {
  let state: Camera = { x: 0, y: 0, scale: 1.0 };
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach(listener => listener());

  return {
    getState: () => state,

    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Camera 이동
    pan: (dx: number, dy: number) => {
      state = {
        ...state,
        x: state.x + dx,
        y: state.y + dy,
      };
      notify();
    },

    // Camera 줌
    zoom: (factor: number, mouseX: number, mouseY: number) => {
      const newScale = Math.min(Math.max(0.1, state.scale * factor), 50);

      // 마우스 위치 기준 World 좌표 계산
      const worldX = (mouseX - state.x) / state.scale;
      const worldY = (mouseY - state.y) / state.scale;

      state = {
        scale: newScale,
        x: mouseX - worldX * newScale,
        y: mouseY - worldY * newScale,
      };

      notify();
    },
  };
};

export const cameraStore = createCameraStore();
