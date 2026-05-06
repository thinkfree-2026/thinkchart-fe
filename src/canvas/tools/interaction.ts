import { CIRCLE_COLOR, CIRCLE_RADIUS, GUIDE_CIRCLE_COLOR } from '../constants/index.ts';
import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { getHoveredCircleIndex } from './collision.ts';
import { createPulseAnimation } from './pulseAnimation.ts';

// 사용자의 마우스 및 키보드 입력을 처리하고 렌더링 상태를 갱신하는 상호작용 제어기
export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isDragging = false;

  const currentMousePosition = { x: 0, y: 0 };

  // 외부 모듈로 분리된 펄스 애니메이션 객체 초기화
  const pulseAnimation = createPulseAnimation(
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

  // 입력, 카메라, 데이터 변경 시 렌더링 파이프라인에 전달할 상태 갱신
  const updateGuideCircleState = () => {
    const { camera } = cameraStore.state;
    const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

    selectionStore.setHover(hoveredIndex);

    const isOverCircle = hoveredIndex !== -1;
    const shouldShowGuide = !isDragging && !isOverCircle;

    if (shouldShowGuide) {
      if (!pulseAnimation.isCharging) {
        guideCircleStore.set({
          x: worldPosition.x,
          y: worldPosition.y,
          radius: CIRCLE_RADIUS * pulseAnimation.currentCount,
          color: GUIDE_CIRCLE_COLOR,
        });
      }
      guideCircleStore.show();
    } else {
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
      canvas.style.cursor = 'default';
    }
  };

  // 상호작용 시작 처리 (이동 준비 또는 객체 선택)
  const onPointerDown = (event: PointerEvent) => {
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;

    // 휠 클릭 또는 스페이스바 조합 시 캔버스 패닝 모드 진입
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

      selectionStore.setSelect(hoveredIndex);

      // 빈 공간 클릭 시 원 생성 애니메이션 트리거
      if (hoveredIndex === -1) {
        pulseAnimation.start();
      }
    }
  };

  // 커서 이동에 따른 상태 변경 및 패닝 처리
  const onPointerMove = (event: PointerEvent) => {
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;

    if (isDragging) {
      cameraStore.pan(event.movementX, event.movementY);
    }

    updateGuideCircleState();
  };

  // 상호작용 종료 처리 (패닝 종료 또는 원 생성 확정)
  const onPointerUp = (event: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
      return;
    }

    if (event.button === 0) {
      if (!pulseAnimation.isCharging) return;

      const currentCount = pulseAnimation.stop();

      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      circleStore.addCircle({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * currentCount,
        color: CIRCLE_COLOR,
      });

      const newCircleIndex = circleStore.getCircles().length - 1;
      selectionStore.setSelect(newCircleIndex);

      guideCircleStore.setRadius(CIRCLE_RADIUS);

      updateGuideCircleState();
    } else {
      pulseAnimation.cancel();
    }
  };

  // 캔버스 이탈 시 예외 처리
  const onPointerLeave = () => {
    guideCircleStore.hide();
    selectionStore.setHover(-1);
    pulseAnimation.cancel();
  };

  // 마우스 휠을 이용한 줌 인/아웃 또는 트랙패드 패닝 처리
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

  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  cleanupTasks.push(() => {
    pulseAnimation.cancel();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
  });
};
