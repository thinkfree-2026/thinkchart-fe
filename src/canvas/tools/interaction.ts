import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore } from '../store/index.ts';

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isDragging = false;

  // 카메라 이동 시작 및 원 생성
  const onPointerDown = (e: PointerEvent) => {
    // 카메라 이동 (마우스 휠 클릭 또는 Ctrl+좌클릭)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
    }

    // 원 생성 (Shift + 좌클릭)
    else if (e.button === 0 && e.shiftKey) {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(e.clientX, e.clientY, camera);

      circleStore.addCircle({
        x: worldPos.x,
        y: worldPos.y,
        size: 100,
        r: 99 / 255,
        g: 102 / 255,
        b: 241 / 255,
        a: 1.0,
      });
    }
  };

  // 카메라 이동
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    cameraStore.pan(e.movementX, e.movementY);
  };

  // 카메라 이동 종료
  const onPointerUp = () => {
    isDragging = false;
    canvas.style.cursor = 'default';
  };

  // 카메라 줌 인/아웃
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey) {
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * -zoomIntensity);

      cameraStore.zoom(zoomFactor, e.clientX, e.clientY);
    } else {
      cameraStore.pan(-e.deltaX, -e.deltaY);
    }
  };

  // 이벤트 리스너 연결
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // 이벤트 리스너 제거
  cleanupTasks.push(() => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
  });
};
