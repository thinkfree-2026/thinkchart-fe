import { createEngine } from './renderer/index.ts';
import { setupInteraction } from './tools/index.ts';

export const Canvas = () => {
  const cleanupTasks: Array<() => void> = [];

  const initializeCallback = (canvasElement: HTMLCanvasElement) => {
    createEngine(canvasElement, cleanupTasks); // WebGL 엔진 연결
    setupInteraction(canvasElement, cleanupTasks); // 이벤트 매니저 연결
  };

  const cleanupCallback = () => {
    cleanupTasks.forEach(task => task());
    cleanupTasks.length = 0;
  };

  return (
    <canvas
      id="canvas"
      class="block h-full w-full cursor-default touch-none bg-[#f0f0f0] bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]"
      oneffect={(canvasElement: HTMLCanvasElement) => {
        initializeCallback(canvasElement);
        return () => {
          cleanupCallback();
        };
      }}
    />
  );
};
