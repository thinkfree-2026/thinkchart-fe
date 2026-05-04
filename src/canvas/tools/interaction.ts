import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore } from '../store/index.ts';

import { increaseCounter } from './increaseCounter.ts';

const CIRCLE_SIZE = 100;
const CIRCLE_COLOR = { r: 99 / 255, g: 102 / 255, b: 241 / 255 };
const GUIDE_CIRCLE_COLOR = { r: 0, g: 0, b: 0 };
const GUIDE_CIRCLE_OPACITY = 0.05;

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isDragging = false;

  const currentMouse = { x: 0, y: 0 };
  const increaseGuideCircle = increaseCounter(
    currentCount => {
      guideCircleStore.updateSize(CIRCLE_SIZE * currentCount);
    },
    (pulseSize, currentCount) => {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(currentMouse.x, currentMouse.y, camera);

      guideCircleStore.createGuideCircle({
        x: worldPos.x,
        y: worldPos.y,
        size: CIRCLE_SIZE * currentCount + pulseSize,
        ...GUIDE_CIRCLE_COLOR,
        a: GUIDE_CIRCLE_OPACITY,
      });
    }
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = true;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
    }
  };

  // 카메라 이동 시작
  const onPointerDown = (e: PointerEvent) => {
    currentMouse.x = e.clientX;
    currentMouse.y = e.clientY;

    // 카메라 이동 (마우스 휠 클릭 또는 Space+좌클릭)
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      increaseGuideCircle.start();
    }
  };

  // 카메라 이동
  const onPointerMove = (e: PointerEvent) => {
    currentMouse.x = e.clientX;
    currentMouse.y = e.clientY;

    if (isDragging) {
      cameraStore.pan(e.movementX, e.movementY);
      return;
    }

    // 가이드 원 생성 (좌클릭)
    if (!increaseGuideCircle.isCharging) {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(currentMouse.x, currentMouse.y, camera);

      guideCircleStore.createGuideCircle({
        x: worldPos.x,
        y: worldPos.y,
        size: CIRCLE_SIZE * increaseGuideCircle.currentCount,
        ...GUIDE_CIRCLE_COLOR,
        a: GUIDE_CIRCLE_OPACITY,
      });
    }
  };

  // 카메라 이동 종료
  const onPointerUp = (e: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'default';
      return;
    }

    // 원 생성 (좌클릭)
    if (e.button === 0) {
      if (!increaseGuideCircle.isCharging) return;

      const currentCount = increaseGuideCircle.stop();

      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(currentMouse.x, currentMouse.y, camera);

      circleStore.addCircle({
        x: worldPos.x,
        y: worldPos.y,
        size: CIRCLE_SIZE * currentCount,
        ...CIRCLE_COLOR,
        a: 1.0,
      });

      guideCircleStore.updateSize(CIRCLE_SIZE);
    } else {
      increaseGuideCircle.cancel();
    }
  };

  // 캔버스 벗어남
  const onPointerLeave = () => {
    guideCircleStore.updateVisibility(false);
    increaseGuideCircle.cancel();
  };

  // 카메라 줌 인/아웃
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (isSpacePressed) {
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

  // 이벤트 리스너 연결
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // 이벤트 리스너 제거
  cleanupTasks.push(() => {
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
  });
};
