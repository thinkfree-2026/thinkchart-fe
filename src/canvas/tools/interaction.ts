import { cameraStore } from '../store/index.ts';

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isDragging = false;

  // 마우스 클릭 - 이동 시작
  const onPointerDown = (e: PointerEvent) => {
    // 휠 클릭(1) 또는 Ctrl + 좌클릭(0)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  // 마우스 이동 - 드래그
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    cameraStore.pan(e.movementX, e.movementY);
  };

  // 마우스 뗌 - 이동 종료
  const onPointerUp = () => {
    isDragging = false;
    canvas.style.cursor = 'default';
  };

  // 마우스 휠 - 줌 인/아웃
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * -zoomIntensity);
      cameraStore.zoom(zoomFactor, e.clientX, e.clientY);
    }
  };

  // DOM 이벤트 연결
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // 언마운트 시 이벤트 리스너 제거
  cleanupTasks.push(() => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
  });
};
