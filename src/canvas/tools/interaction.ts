import { CIRCLE_COLOR, CIRCLE_RADIUS, GUIDE_CIRCLE_COLOR } from '../constants/index.ts';
import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { getHoveredCircleIndex } from './collision.ts';
import { createPulseAnimation } from './pulseAnimation.ts';

// 사용자 입력 처리 및 캔버스 컴포넌트 제어
export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isCameraDragging = false;
  let isCircleDragging = false;
  let autoCameraPanningId: number | null = null;

  const currentMousePosition = { x: 0, y: 0 };

  // 원 생성 시 펄스 애니메이션 초기화
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

  // 이동중인 원의 테두리가 화면 끝에 도달할 경우 카메라를 이동시키는 로직
  const updateAutoCameraPanning = () => {
    if (!isCircleDragging) return;

    const { selectedIndex } = selectionStore.state.selection;
    if (selectedIndex === -1) {
      stopAutoCameraPanning();
      return;
    }

    const circles = circleStore.getCircles();
    const targetCircle = circles[selectedIndex];
    const { camera } = cameraStore.state;

    // 월드 좌표 기반의 원 위치를 현재 카메라 배율이 반영된 화면 픽셀 좌표로 변환
    const screenX = targetCircle.x * camera.scale + camera.x;
    const screenY = targetCircle.y * camera.scale + camera.y;
    const screenRadius = targetCircle.radius * camera.scale;

    let panSpeedX = 0;
    let panSpeedY = 0;
    const BASE_PAN_SPEED = 8; // 매 프레임당 이동할 기준 픽셀 속도

    // 좌우 경계 도달 확인 및 이동 방향 결정
    if (screenX - screenRadius <= 0) {
      panSpeedX = BASE_PAN_SPEED;
    } else if (screenX + screenRadius >= canvas.clientWidth) {
      panSpeedX = -BASE_PAN_SPEED;
    }

    // 상하 경계 도달 확인 및 이동 방향 결정
    if (screenY - screenRadius <= 0) {
      panSpeedY = BASE_PAN_SPEED;
    } else if (screenY + screenRadius >= canvas.clientHeight) {
      panSpeedY = -BASE_PAN_SPEED;
    }

    // 경계에 닿아 이동 속도가 발생한 경우 카메라 및 원 좌표 갱신
    if (panSpeedX !== 0 || panSpeedY !== 0) {
      cameraStore.pan(panSpeedX, panSpeedY);

      // 카메라가 이동하는 만큼 원의 월드 좌표를 반대로 보정하여 화면 상에서 커서 위치에 고정
      circleStore.updateCirclePosition(
        selectedIndex,
        targetCircle.x - panSpeedX / camera.scale,
        targetCircle.y - panSpeedY / camera.scale
      );

      updateGuideCircleState();
    }

    // 마우스를 뗄 때까지 프레임마다 검사
    autoCameraPanningId = requestAnimationFrame(updateAutoCameraPanning);
  };

  // 자동 카메라 이동 시작
  const startAutoCameraPanning = () => {
    if (autoCameraPanningId === null) {
      autoCameraPanningId = requestAnimationFrame(updateAutoCameraPanning);
    }
  };

  // 자동 카메라 이동 정지
  const stopAutoCameraPanning = () => {
    if (autoCameraPanningId !== null) {
      cancelAnimationFrame(autoCameraPanningId);
      autoCameraPanningId = null;
    }
  };

  // 가이드 원의 상태 및 가시성 실시간 업데이트
  const updateGuideCircleState = () => {
    const { camera } = cameraStore.state;
    const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

    selectionStore.setHover(hoveredIndex);

    const isOverCircle = hoveredIndex !== -1;
    const shouldShowGuide = !isCameraDragging && !isCircleDragging && !isOverCircle;

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

  // 키보드 입력에 따라 액션 ㅈㅔ어
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = true;
      canvas.style.cursor = 'grabbing';
    }

    // 백스페이스 키 입력 시 선택된 원 삭제
    if (e.code === 'Backspace') {
      const { selectedIndex } = selectionStore.state.selection;
      if (selectedIndex !== -1) {
        e.preventDefault();
        circleStore.deleteCircle(selectedIndex);
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

  // 마우스 클릭 시 선택, 드래그 시작 또는 생성 애니메이션 실행
  const onPointerDown = (e: PointerEvent) => {
    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

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
        isCircleDragging = true;
        startAutoCameraPanning();
      } else {
        pulseAnimation.start();
      }
    }
  };

  // 마우스 이동 시 카메라 & 원 위치 이동
  const onPointerMove = (e: PointerEvent) => {
    const { camera } = cameraStore.state;

    const previousWorldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const currentWorldPosition = screenToWorld(e.clientX, e.clientY, camera);
    const deltaWorldX = currentWorldPosition.x - previousWorldPosition.x;
    const deltaWorldY = currentWorldPosition.y - previousWorldPosition.y;

    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (isCameraDragging) {
      cameraStore.pan(e.movementX, e.movementY);
    } else if (isCircleDragging) {
      const { selectedIndex } = selectionStore.state.selection;
      if (selectedIndex !== -1) {
        const circles = circleStore.getCircles();
        const targetCircle = circles[selectedIndex];

        // 원 월드 좌표 수정
        circleStore.updateCirclePosition(selectedIndex, targetCircle.x + deltaWorldX, targetCircle.y + deltaWorldY);
      }
    }

    updateGuideCircleState();
  };

  // 클릭 해제 시 모든 드래그 상태 & 원 생성
  const onPointerUp = (e: PointerEvent) => {
    if (isCameraDragging) {
      isCameraDragging = false;
      canvas.style.cursor = isSpacePressed ? 'grabbing' : 'default';
      stopAutoCameraPanning();
      updateGuideCircleState();
      return;
    }

    if (isCircleDragging) {
      isCircleDragging = false;
      stopAutoCameraPanning();
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

      const newCircleIndex = circleStore.getCircles().length - 1;
      selectionStore.setSelect(newCircleIndex);

      guideCircleStore.setRadius(CIRCLE_RADIUS);
      updateGuideCircleState();
    } else {
      pulseAnimation.cancel();
    }
  };

  const onPointerLeave = () => {
    if (!isCircleDragging) {
      guideCircleStore.hide();
      selectionStore.setHover(-1);
      pulseAnimation.cancel();
      stopAutoCameraPanning();
    }
  };

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
