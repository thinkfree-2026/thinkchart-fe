import { createEngine } from './renderer/index.ts';
import { setupInteraction } from './tools/index.ts';

/**
 * 캔버스 컴포넌트
 * UI 렌더링 및 모듈(엔진, 인터랙션)의 생명주기 관리
 */
export const Canvas = (): HTMLCanvasElement => {
  // 컴포넌트가 언마운트 될 때 실행할 클린업 함수 리스트
  const cleanupTasks: Array<() => void> = [];

  const canvasElement = (
    <canvas
      id="canvas"
      class="block h-full w-full cursor-default touch-none bg-[#f0f0f0] bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]"
    />
  ) as HTMLCanvasElement;

  createEngine(canvasElement, cleanupTasks); // WebGL 엔진 연결
  setupInteraction(canvasElement, cleanupTasks); // 이벤트 매니저 연결

  // // DOM에서 사라질 때 누적된 정리 함수 일괄 실행
  // if (!canvasElement) {
  //   cleanupTasks.forEach(task => task());
  //   cleanupTasks.length = 0; // 배열 비우기
  //   return;
  // }

  return canvasElement;
};
