import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { increaseCounter } from './increaseCounter.ts';

const CIRCLE_SIZE = 100;
const CIRCLE_COLOR = { r: 199 / 255, g: 210 / 255, b: 254 / 255 };
const GUIDE_CIRCLE_COLOR = { r: 0, g: 0, b: 0 };
const GUIDE_CIRCLE_OPACITY = 0.05;

// 커서에 있는 원 인덱스 탐색
const getHoveredCircleIndex = (worldX: number, worldY: number) => {
  const circles = circleStore.getCircles();

  // 나중에 그려진 원부터 검사
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    const dx = worldX - circle.x;
    const dy = worldY - circle.y;
    // 반지름의 제곱, 거리의 제곱 비교
    if (dx * dx + dy * dy <= (circle.size / 2) * (circle.size / 2)) {
      return i;
    }
  }

  return -1;
};

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isDragging = false;

  const currentMouse = { x: 0, y: 0 };
  const increaseGuideCircle = increaseCounter(
    currentCount => {
      guideCircleStore.setSize(CIRCLE_SIZE * currentCount);
    },
    (pulseSize, currentCount) => {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(currentMouse.x, currentMouse.y, camera);

      guideCircleStore.set({
        x: worldPos.x,
        y: worldPos.y,
        size: CIRCLE_SIZE * currentCount + pulseSize,
        ...GUIDE_CIRCLE_COLOR,
        a: GUIDE_CIRCLE_OPACITY,
      });
    }
  );

  // 마우스, 카메라, 데이터가 변할 때마다 호출할 단일 상태 갱신 함수
  const updateGuideCircleState = () => {
    const { camera } = cameraStore.state;
    const worldPos = screenToWorld(currentMouse.x, currentMouse.y, camera);
    const hoveredIndex = getHoveredCircleIndex(worldPos.x, worldPos.y);

    // 호버 상태 갱신
    selectionStore.setHover(hoveredIndex);

    // 가이드 원의 isVisible 제어
    const isOverCircle = hoveredIndex !== -1;
    const shouldShowGuide = !isDragging && !isOverCircle;

    if (shouldShowGuide) {
      // 가이드 원 표시
      if (!increaseGuideCircle.isCharging) {
        guideCircleStore.set({
          x: worldPos.x,
          y: worldPos.y,
          size: CIRCLE_SIZE * increaseGuideCircle.currentCount,
          ...GUIDE_CIRCLE_COLOR,
          a: GUIDE_CIRCLE_OPACITY,
        });
      }
      guideCircleStore.show();
    } else {
      // 가이드 원 숨김
      guideCircleStore.hide();
    }
  };

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
      updateGuideCircleState();
      return;
    }

    if (e.button === 0) {
      const { camera } = cameraStore.state;
      const worldPos = screenToWorld(e.clientX, e.clientY, camera);
      const hoveredIndex = getHoveredCircleIndex(worldPos.x, worldPos.y);

      // 클릭한 원을 선택 상태로 설정 (빈 공간 클릭 시 -1로 해제)
      selectionStore.setSelect(hoveredIndex);

      // 빈 공간을 클릭했을 때만 가이드 원 애니메이션 동작
      if (hoveredIndex === -1) {
        increaseGuideCircle.start();
      }
    }
  };

  // 카메라 이동
  const onPointerMove = (e: PointerEvent) => {
    currentMouse.x = e.clientX;
    currentMouse.y = e.clientY;

    if (isDragging) {
      cameraStore.pan(e.movementX, e.movementY);
    }

    updateGuideCircleState();
  };

  // 카메라 이동 종료
  const onPointerUp = (e: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
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

      guideCircleStore.setSize(CIRCLE_SIZE);

      updateGuideCircleState();
    } else {
      increaseGuideCircle.cancel();
    }
  };

  // 캔버스 벗어남
  const onPointerLeave = () => {
    guideCircleStore.hide();
    selectionStore.setHover(-1); // 나갔을 때 호버도 해제
    increaseGuideCircle.cancel();
  };

  // 카메라 줌 인/아웃
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    currentMouse.x = e.clientX;
    currentMouse.y = e.clientY;

    if (isSpacePressed) {
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * -zoomIntensity);

      cameraStore.zoom(zoomFactor, e.clientX, e.clientY);
    } else {
      cameraStore.pan(-e.deltaX, -e.deltaY);
    }

    updateGuideCircleState();
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
    increaseGuideCircle.cancel();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
  });
};
