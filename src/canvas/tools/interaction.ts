import { CIRCLE_COLOR, CIRCLE_RADIUS, GUIDE_CIRCLE_COLOR } from '../constants/index.ts';
import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { increaseCounter } from './increaseCounter.ts';

// 마우스 커서 위치에 존재하는 원의 인덱스 탐색
const getHoveredCircleIndex = (worldX: number, worldY: number) => {
  const circles = circleStore.getCircles();

  // 가장 위에 그려진(배열의 마지막) 원부터 역순으로 검사
  for (let index = circles.length - 1; index >= 0; index--) {
    const circle = circles[index];
    const mouseX = Math.abs(worldX - circle.x);
    const mouseY = Math.abs(worldY - circle.y);

    if (mouseX <= circle.radius && mouseY <= circle.radius) {
      return index;
    }
  }

  return -1;
};

export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isDragging = false;

  const currentMousePosition = { x: 0, y: 0 };
  const increaseGuideCircle = increaseCounter(
    currentCount => {
      guideCircleStore.setRadius(CIRCLE_RADIUS * currentCount);
    },
    (pulseSize, currentCount) => {
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      guideCircleStore.set({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * currentCount + pulseSize,
        color: GUIDE_CIRCLE_COLOR,
      });
    }
  );

  // 마우스, 카메라, 데이터가 변할 때마다 호출할 단일 상태 갱신 함수
  const updateGuideCircleState = () => {
    const { camera } = cameraStore.state;
    const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

    // 호버 상태 갱신
    selectionStore.setHover(hoveredIndex);

    // 가이드 원의 가시성 제어
    const isOverCircle = hoveredIndex !== -1;
    const shouldShowGuide = !isDragging && !isOverCircle;

    if (shouldShowGuide) {
      // 가이드 원 표시
      if (!increaseGuideCircle.isCharging) {
        guideCircleStore.set({
          x: worldPosition.x,
          y: worldPosition.y,
          radius: CIRCLE_RADIUS * increaseGuideCircle.currentCount,
          color: GUIDE_CIRCLE_COLOR,
        });
      }
      guideCircleStore.show();
    } else {
      // 가이드 원 숨김
      guideCircleStore.hide();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      isSpacePressed = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      isSpacePressed = false;
      canvas.style.cursor = 'grabbing';
    }
  };

  // 상호작용 시작
  const onPointerDown = (event: PointerEvent) => {
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;

    // 카메라 이동 (마우스 휠 클릭 또는 Space + 좌클릭)
    if (event.button === 1 || (event.button === 0 && isSpacePressed)) {
      isDragging = true;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
      return;
    }

    if (event.button === 0) {
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(event.clientX, event.clientY, camera);
      const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

      // 클릭한 원을 선택 상태로 설정 (빈 공간 클릭 시 -1로 해제됨)
      selectionStore.setSelect(hoveredIndex);

      // 빈 공간을 클릭했을 때만 가이드 원 크기 증가 애니메이션 동작
      if (hoveredIndex === -1) {
        increaseGuideCircle.start();
      }
    }
  };

  // 커서 이동
  const onPointerMove = (event: PointerEvent) => {
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;

    if (isDragging) {
      cameraStore.pan(event.movementX, event.movementY);
    }

    updateGuideCircleState();
  };

  // 상호작용 종료
  const onPointerUp = (event: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
      return;
    }

    // 원 생성 (좌클릭 해제 시)
    if (event.button === 0) {
      if (!increaseGuideCircle.isCharging) return;

      const currentCount = increaseGuideCircle.stop();

      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      circleStore.addCircle({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * currentCount,
        color: CIRCLE_COLOR,
      });

      // 새롭게 생성한 원을 즉시 선택 상태로 설정
      const newCircleIndex = circleStore.getCircles().length - 1;
      selectionStore.setSelect(newCircleIndex);

      guideCircleStore.setRadius(CIRCLE_RADIUS);

      updateGuideCircleState();
    } else {
      increaseGuideCircle.cancel();
    }
  };

  // 커서가 캔버스 영역을 벗어남
  const onPointerLeave = () => {
    guideCircleStore.hide();
    selectionStore.setHover(-1);
    increaseGuideCircle.cancel();
  };

  // 카메라 확대 및 축소
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();

    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;

    if (event.ctrlKey) {
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(event.deltaY * -zoomIntensity);

      cameraStore.zoom(zoomFactor, event.clientX, event.clientY);
    } else {
      cameraStore.pan(-event.deltaX, -event.deltaY);
    }

    updateGuideCircleState();
  };

  // 브라우저 이벤트 리스너 연결
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // 컴포넌트 해제 시 메모리 누수를 방지하기 위한 이벤트 리스너 제거
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
