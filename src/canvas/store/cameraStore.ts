import { createStore } from '../../utils/index.ts';

const createCameraStore = () => {
  const { state, subscribe } = createStore({
    camera: {
      x: 0,
      y: 0,
      scale: 1.0,
    },
  });

  return {
    state,
    subscribe,
    // Camera 이동
    pan: (dx: number, dy: number) => {
      state.camera = {
        ...state.camera,
        x: state.camera.x + dx,
        y: state.camera.y + dy,
      };
    },
    // Camera 줌
    zoom: (factor: number, mouseX: number, mouseY: number) => {
      const currentScale = state.camera.scale;
      // 마우스 위치 기준 World 좌표 계산
      const worldX = (mouseX - state.camera.x) / currentScale;
      const worldY = (mouseY - state.camera.y) / currentScale;

      const newScale = Math.min(Math.max(0.1, currentScale * factor), 50);

      state.camera = {
        x: mouseX - worldX * newScale,
        y: mouseY - worldY * newScale,
        scale: newScale,
      };
    },
  };
};

export const cameraStore = createCameraStore();
