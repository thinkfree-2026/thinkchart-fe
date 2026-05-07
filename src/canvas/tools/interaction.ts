import { CIRCLE_COLOR, CIRCLE_RADIUS, GUIDE_CIRCLE_COLOR } from '../constants/index.ts';
import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { getHoveredCircleIndex } from './collision.ts';
import { createPulseAnimation } from './pulseAnimation.ts';

// 사용자의 마우스 및 키보드 입력을 처리하고 렌더링 상태를 갱신하는 상호작용 제어기
export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isCameraDragging = false;
  let isCircleDragging = false;

  const currentMousePosition = { x: 0, y: 0 };

  // 펄스 애니메이션 초기화
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
    const shouldShowGuide = !isCameraDragging && !isOverCircle;

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

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = true;
      canvas.style.cursor = 'grabbing';
    }

    // 선택된 원이 존재할 경우 백스페이스 키 입력 시 데이터 삭제 수행
    if (e.code === 'Backspace') {
      const { selectedIndex } = selectionStore.state.selection;

      if (selectedIndex !== -1) {
        e.preventDefault();
        // 선택된 원 제거
        circleStore.deleteCircle(selectedIndex);

        // 선택 상태 초기화 및 현재 마우스 위치의 호버 상태 다시 계산
        selectionStore.setSelect(-1);
        updateGuideCircleState();
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      canvas.style.cursor = 'default';
    }
  };

  // 상호작용 시작 처리 (이동 준비 또는 원 선택)
  const onPointerDown = (e: PointerEvent) => {
    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    // 휠 클릭 또는 스페이스바 조합 시 캔버스 패닝 모드 진입
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      isCameraDragging = true;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
      return;
    }

    if (e.button === 0) {
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(e.clientX, e.clientY, camera);
      const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

      selectionStore.setSelect(hoveredIndex);

      if (hoveredIndex !== -1) {
        // 원 클릭 시 해당 원 이동시키는 드래그 모드 활성화
        isCircleDragging = true;
      } else {
        // 빈 공간 클릭 시 원 생성 애니메이션 실행
        pulseAnimation.start();
      }
    }
  };

  // 커서 이동에 따른 카메라 패닝, 원 좌표 갱신 및 가이드 상태 업데이트
  const onPointerMove = (e: PointerEvent) => {
    const { camera } = cameraStore.state;

    // 마우스 이동 전후의 월드 좌표를 비교하여 실제 화면 이동 거리 산출
    const previousWorldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const currentWorldPosition = screenToWorld(e.clientX, e.clientY, camera);
    const deltaWorldX = currentWorldPosition.x - previousWorldPosition.x;
    const deltaWorldY = currentWorldPosition.y - previousWorldPosition.y;

    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (isCameraDragging) {
      cameraStore.pan(e.movementX, e.movementY);
    } else if (isCircleDragging) {
      // 드래그 중인 원의 좌표를 마우스 이동 거리만큼 실시간 갱신
      const { selectedIndex } = selectionStore.state.selection;
      if (selectedIndex !== -1) {
        const targetCircle = circleStore.getCircles()[selectedIndex];
        circleStore.updateCirclePosition(selectedIndex, targetCircle.x + deltaWorldX, targetCircle.y + deltaWorldY);
      }
    }

    updateGuideCircleState();
  };

  // 클릭 해제 시 카메라/원 이동 종료 및 원 생성
  const onPointerUp = (e: PointerEvent) => {
    // 카메라 드래그 모드 해제
    if (isCameraDragging) {
      isCameraDragging = false;
      canvas.style.cursor = isSpacePressed ? 'grabbing' : 'default';
      updateGuideCircleState();
      return;
    }

    // 원 드래그 모드 해제
    if (isCircleDragging) {
      isCircleDragging = false;
      updateGuideCircleState();
      return;
    }

    if (e.button === 0) {
      if (!pulseAnimation.isCharging) return;

      const finalCount = pulseAnimation.stop();
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      circleStore.addCircle({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * finalCount,
        color: CIRCLE_COLOR,
      });

      // 생성 직후 해당 원을 선택 상태로 변경
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
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (e.ctrlKey) {
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * -zoomIntensity);

      cameraStore.zoom(zoomFactor, e.clientX, e.clientY);
    } else {
      cameraStore.pan(-e.deltaX, -e.deltaY);
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
