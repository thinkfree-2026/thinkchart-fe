import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore } from '../store/index.ts';

const CREATE_SIZE = 100;
const CREATE_COLOR = { r: 99 / 255, g: 102 / 255, b: 241 / 255 };

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isDragging = false;

  // 카메라 이동 시작
  const onPointerDown = (e: PointerEvent) => {
    // 카메라 이동 (마우스 휠 클릭 또는 Ctrl+좌클릭)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  // 카메라 이동
  const onPointerMove = (e: PointerEvent) => {
    if (isDragging) {
      cameraStore.pan(e.movementX, e.movementY);
      return;
    }

    const { camera } = cameraStore.state;
    const worldPos = screenToWorld(e.clientX, e.clientY, camera);

    // 가이드 원 생성 (좌클릭)
    guideCircleStore.createGuideCircle({
      x: worldPos.x,
      y: worldPos.y,
      size: CREATE_SIZE,
      ...CREATE_COLOR,
      a: 0.7,
    });
  };

  // 카메라 이동 종료
  const onPointerUp = (e: PointerEvent) => {
    isDragging = false;
    canvas.style.cursor = 'default';

    console.log(e.button, e.ctrlKey);

    // 원 생성 (좌클릭)
    if (e.button === 0 && !e.ctrlKey) {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(e.clientX, e.clientY, camera);

      circleStore.addCircle({
        x: worldPos.x,
        y: worldPos.y,
        size: CREATE_SIZE,
        ...CREATE_COLOR,
        a: 1.0,
      });
    }
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

      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(e.clientX, e.clientY, camera);

      guideCircleStore.pan(worldPos.x, worldPos.y);
    }
  };

  // 캔버스 벗어남
  const onPointerLeave = () => {
    guideCircleStore.updateVisibility(false);
  };

  // 이벤트 리스너 연결
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('pointerleave', onPointerLeave);

  // 이벤트 리스너 제거
  cleanupTasks.push(() => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('pointerleave', onPointerLeave);
  });
};
