import { createEngine } from './renderer/index.ts';
import { setupInteraction } from './tools/index.ts';

/**
 * 캔버스 컴포넌트
 * UI 렌더링 및 모듈(엔진, 인터랙션)의 생명주기 관리
 */
const Canvas = () => {
  // 컴포넌트가 언마운트 될 때 실행할 클린업 함수 리스트
  const cleanupTasks: Array<() => void> = [];

  const initialize = (element: HTMLCanvasElement | null) => {
    // DOM에서 언마운트 될 때 누적된 정리 함수 일괄 실행
    if (!element) {
      cleanupTasks.forEach(task => task());
      cleanupTasks.length = 0; // 배열 비우기
      return;
    }

    // WebGL 엔진 연결
    createEngine(element, cleanupTasks);

    // 이벤트 매니저 연결
    setupInteraction(element, cleanupTasks);
  };

  // DOMContentLoaded 시 이벤트 리스너 바인딩
  window.addEventListener('DOMContentLoaded', () => {
    initialize(document.getElementById('canvas') as HTMLCanvasElement);
  });

  return (
    <canvas
      id="canvas"
      class="block h-full w-full cursor-default bg-[#f0f0f0] bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]"
    />
  );
};

export default Canvas;
